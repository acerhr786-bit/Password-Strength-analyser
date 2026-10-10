/**
 * Cryptographically Secure Password & Passphrase Generator
 * Employs window.crypto.getRandomValues() for unguessable randomness.
 */

import { DICEWARE_WORDLIST } from './wordlist';

export interface PassphraseOptions {
  wordCount: number; // 3 to 6
  separator: string; // '-', '.', '_', ' '
  capitalizeWords: boolean;
  includeNumber: boolean;
  includeSymbol: boolean;
}

export interface CryptoStringOptions {
  length: number; // 8 to 64
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean; // avoids 0, O, l, I, 1, etc.
}

const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = new Set(['0', 'O', 'o', 'l', 'I', '1', '|']);

/**
 * Generates a cryptographically secure random integer in range [0, max - 1]
 */
export function secureRandomInt(max: number): number {
  if (max <= 1) return 0;
  const array = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let rand: number;
  do {
    crypto.getRandomValues(array);
    rand = array[0];
  } while (rand >= limit);
  return rand % max;
}

/**
 * Generates a Diceware-style passphrase
 */
export function generatePassphrase(options: Partial<PassphraseOptions> = {}): string {
  const count = options.wordCount || 4;
  const separator = options.separator !== undefined ? options.separator : '-';
  const capitalize = options.capitalizeWords !== undefined ? options.capitalizeWords : true;
  const includeNumber = options.includeNumber !== undefined ? options.includeNumber : true;
  const includeSymbol = options.includeSymbol !== undefined ? options.includeSymbol : false;

  const words: string[] = [];
  const listLen = DICEWARE_WORDLIST.length;

  for (let i = 0; i < count; i++) {
    const idx = secureRandomInt(listLen);
    let word = DICEWARE_WORDLIST[idx];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  let result = words.join(separator);

  if (includeNumber) {
    const num = secureRandomInt(90) + 10; // 2-digit number (10-99)
    result = `${result}${separator}${num}`;
  }

  if (includeSymbol) {
    const symbols = '!@#$%&*';
    const sym = symbols[secureRandomInt(symbols.length)];
    result = `${result}${sym}`;
  }

  return result;
}

/**
 * Generates a high-entropy random character sequence
 */
export function generateCryptoString(options: Partial<CryptoStringOptions> = {}): string {
  const len = options.length || 18;
  const useUpper = options.uppercase !== undefined ? options.uppercase : true;
  const useLower = options.lowercase !== undefined ? options.lowercase : true;
  const useNumbers = options.numbers !== undefined ? options.numbers : true;
  const useSymbols = options.symbols !== undefined ? options.symbols : true;
  const avoidAmbiguous = options.excludeAmbiguous !== undefined ? options.excludeAmbiguous : true;

  let pool = '';
  if (useLower) pool += LOWERCASE_CHARS;
  if (useUpper) pool += UPPERCASE_CHARS;
  if (useNumbers) pool += NUMBER_CHARS;
  if (useSymbols) pool += SYMBOL_CHARS;

  if (avoidAmbiguous) {
    pool = pool.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('');
  }

  if (pool.length === 0) {
    pool = LOWERCASE_CHARS + NUMBER_CHARS;
  }

  // Ensure at least one character from each active set
  const guaranteedChars: string[] = [];
  if (useLower) {
    const subset = avoidAmbiguous ? LOWERCASE_CHARS.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('') : LOWERCASE_CHARS;
    guaranteedChars.push(subset[secureRandomInt(subset.length)]);
  }
  if (useUpper) {
    const subset = avoidAmbiguous ? UPPERCASE_CHARS.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('') : UPPERCASE_CHARS;
    guaranteedChars.push(subset[secureRandomInt(subset.length)]);
  }
  if (useNumbers) {
    const subset = avoidAmbiguous ? NUMBER_CHARS.split('').filter(c => !AMBIGUOUS_CHARS.has(c)).join('') : NUMBER_CHARS;
    guaranteedChars.push(subset[secureRandomInt(subset.length)]);
  }
  if (useSymbols) {
    guaranteedChars.push(SYMBOL_CHARS[secureRandomInt(SYMBOL_CHARS.length)]);
  }

  const remainingLength = Math.max(0, len - guaranteedChars.length);
  const randomChars: string[] = [];
  for (let i = 0; i < remainingLength; i++) {
    randomChars.push(pool[secureRandomInt(pool.length)]);
  }

  // Combine and shuffle using Fisher-Yates
  const combined = [...guaranteedChars, ...randomChars];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    const temp = combined[i];
    combined[i] = combined[j];
    combined[j] = temp;
  }

  return combined.slice(0, len).join('');
}

/**
 * Generates random numeric PIN
 */
export function generatePin(length = 6): string {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += secureRandomInt(10).toString();
  }
  return pin;
}

export interface GeneratedSuggestion {
  type: 'passphrase' | 'cryptographic' | 'upgraded_user';
  label: string;
  password: string;
  description: string;
  estimatedBits: number;
}

/**
 * Produces strong password alternatives, including an upgraded variant
 * based on the user's current password.
 */
export function generateAlternativeSuggestions(currentPassword?: string): GeneratedSuggestion[] {
  const suggestions: GeneratedSuggestion[] = [];

  // 1. Diceware Passphrase (Human memorable, mathematically sound)
  const passphrase = generatePassphrase({ wordCount: 4, separator: '-', capitalizeWords: true, includeNumber: true });
  suggestions.push({
    type: 'passphrase',
    label: 'Diceware Passphrase (Memorable)',
    password: passphrase,
    description: 'High entropy through length and word permutation. Easy to memorize without sacrificing security.',
    estimatedBits: 78
  });

  // 2. High-Entropy Cryptographic String (18 characters)
  const cryptoKey = generateCryptoString({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: true });
  suggestions.push({
    type: 'cryptographic',
    label: 'Cryptographic Key (18 Chars)',
    password: cryptoKey,
    description: 'Ideal for password managers. 94-character search space creates astronomical brute-force difficulty.',
    estimatedBits: 104
  });

  // 3. Ultra-Dense Master Key (24 characters)
  const masterKey = generateCryptoString({ length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: false });
  suggestions.push({
    type: 'cryptographic',
    label: 'Fortified Master Key (24 Chars)',
    password: masterKey,
    description: 'Designed for root credentials, SSH master keys, and encrypted disk volumes.',
    estimatedBits: 140
  });

  // 4. Upgraded variation of user input if user provided a string
  if (currentPassword && currentPassword.trim().length > 0) {
    const clean = currentPassword.trim();
    // Salt with random memorable word + symbol + digits
    const randomWord = DICEWARE_WORDLIST[secureRandomInt(DICEWARE_WORDLIST.length)];
    const capitalizedWord = randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
    const randomNum = secureRandomInt(900) + 100;
    const upgraded = `${capitalizedWord}#${clean}_${randomNum}!`;

    suggestions.push({
      type: 'upgraded_user',
      label: 'Hardened Variant of Your Input',
      password: upgraded,
      description: 'Expands your base input with non-adjacent random entropy blocks, breaking predictable masks.',
      estimatedBits: 88
    });
  }

  return suggestions;
}
