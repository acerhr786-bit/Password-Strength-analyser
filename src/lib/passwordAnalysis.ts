/**
 * Password Strength & Cryptographic Analysis Engine
 * Calculates character pools, Shannon entropy, heuristic entropy,
 * pattern detection (walks, sequences, dictionary, leetspeak),
 * threat model crack times, and regulatory compliance.
 */

import {
  COMMON_SUBSTRINGS,
  KEYBOARD_WALKS,
  TOP_BREACHED_PASSWORDS,
  normalizeLeet
} from './commonPasswords';

export interface ThreatModel {
  id: string;
  name: string;
  speedDescription: string;
  guessesPerSecond: number;
  environment: 'online' | 'offline';
  notes: string;
}

export const THREAT_MODELS: ThreatModel[] = [
  {
    id: 'online_throttled',
    name: 'Online Rate-Limited (NIST Baseline)',
    speedDescription: '100 guesses / hour (~0.028/sec)',
    guessesPerSecond: 100 / 3600,
    environment: 'online',
    notes: 'Protected login portal with progressive delays, CAPTCHA, and IP throttling.'
  },
  {
    id: 'online_unthrottled',
    name: 'Online Unthrottled API',
    speedDescription: '1,000 guesses / second',
    guessesPerSecond: 1000,
    environment: 'online',
    notes: 'Unprotected API endpoint without rate-limiting or anti-bot defenses.'
  },
  {
    id: 'offline_slow_kdf',
    name: 'Offline Slow KDF (bcrypt / Argon2id)',
    speedDescription: '10,000 guesses / second',
    guessesPerSecond: 10000,
    environment: 'offline',
    notes: 'Attacker obtained database dump protected with modern slow memory-hard hashing.'
  },
  {
    id: 'offline_single_gpu',
    name: 'Offline Fast GPU (RTX 4090 / MD5 / NTLM)',
    speedDescription: '100 Billion guesses / second (10¹¹/s)',
    guessesPerSecond: 1e11,
    environment: 'offline',
    notes: 'Hashcat running on a single modern high-end GPU targeting fast unsalted algorithms.'
  },
  {
    id: 'offline_gpu_cluster',
    name: 'Massive Cracking Rig (100x GPU Cluster)',
    speedDescription: '10 Trillion guesses / second (10¹³/s)',
    guessesPerSecond: 1e13,
    environment: 'offline',
    notes: 'Dedicated password recovery cluster utilized by state actors or cyber syndicates.'
  }
];

export interface PatternFinding {
  type: 'breached' | 'dictionary' | 'keyboard_walk' | 'sequential' | 'repeated' | 'leetspeak' | 'predictable_pattern';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  penaltyBits: number;
  match?: string;
}

export interface ComplianceStatus {
  nist800_63b: {
    passed: boolean;
    requirements: { label: string; passed: boolean }[];
  };
  pciDss4: {
    passed: boolean;
    requirements: { label: string; passed: boolean }[];
  };
}

export interface PasswordAnalysis {
  length: number;
  charPool: {
    hasLower: boolean;
    hasUpper: boolean;
    hasDigit: boolean;
    hasSymbol: boolean;
    hasUnicode: boolean;
    poolSize: number;
    breakdown: string[];
  };
  shannonEntropy: number; // Theoretical: L * log2(R)
  effectiveEntropy: number; // Penalized by heuristics
  strengthTier: 0 | 1 | 2 | 3 | 4;
  strengthLabel: 'Critically Vulnerable' | 'Weak' | 'Moderate' | 'Strong' | 'Cryptographically Fortified';
  scorePercent: number; // 0 to 100
  findings: PatternFinding[];
  crackTimes: Record<string, { seconds: number; formatted: string }>;
  compliance: ComplianceStatus;
  suggestions: string[];
}

/**
 * Formats crack time seconds into human-readable intervals
 */
export function formatCrackDuration(seconds: number): string {
  if (seconds <= 0.001) return 'Instant (< 1 ms)';
  if (seconds < 1) return `${Math.round(seconds * 1000)} milliseconds`;
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  
  const years = seconds / 31536000;
  if (years < 100) return `${Math.round(years * 10) / 10} years`;
  if (years < 10000) return `${Math.round(years).toLocaleString()} years`;
  if (years < 1e6) return `${(years / 1000).toFixed(1)} thousand years`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} billion years`;
  return `${(years / 1e12).toExponential(2)} trillion years`;
}

/**
 * Main evaluation function
 */
export function analyzePassword(password: string): PasswordAnalysis {
  const length = password.length;
  if (length === 0) {
    return {
      length: 0,
      charPool: {
        hasLower: false,
        hasUpper: false,
        hasDigit: false,
        hasSymbol: false,
        hasUnicode: false,
        poolSize: 0,
        breakdown: []
      },
      shannonEntropy: 0,
      effectiveEntropy: 0,
      strengthTier: 0,
      strengthLabel: 'Critically Vulnerable',
      scorePercent: 0,
      findings: [],
      crackTimes: THREAT_MODELS.reduce((acc, tm) => {
        acc[tm.id] = { seconds: 0, formatted: '0 seconds' };
        return acc;
      }, {} as Record<string, { seconds: number; formatted: string }>),
      compliance: {
        nist800_63b: {
          passed: false,
          requirements: [
            { label: 'Minimum 8 characters (15+ recommended)', passed: false },
            { label: 'Not found in common breach wordlists', passed: true },
            { label: 'Free of simple repetitive sequences', passed: true }
          ]
        },
        pciDss4: {
          passed: false,
          requirements: [
            { label: 'Minimum 12 characters', passed: false },
            { label: 'Contains both alphabetic and numeric characters', passed: false },
            { label: 'Complexity across character classes', passed: false }
          ]
        }
      },
      suggestions: ['Enter a password to evaluate length, complexity, and entropy.']
    };
  }

  // 1. Character Pool Analysis
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9\s]/.test(password) || /\s/.test(password);
  const hasUnicode = /[^\u0000-\u007F]/.test(password);

  let poolSize = 0;
  const breakdown: string[] = [];
  if (hasLower) { poolSize += 26; breakdown.push('Lowercase (26)'); }
  if (hasUpper) { poolSize += 26; breakdown.push('Uppercase (26)'); }
  if (hasDigit) { poolSize += 10; breakdown.push('Digits (10)'); }
  if (hasSymbol) { poolSize += 33; breakdown.push('Symbols & Punctuation (33)'); }
  if (hasUnicode) { poolSize += 100; breakdown.push('Extended Unicode (~100)'); }

  // 2. Shannon Theoretical Entropy: H = L * log2(R)
  const theoreticalEntropy = poolSize > 0 ? length * Math.log2(poolSize) : 0;

  // 3. Pattern Recognition & Heuristic Penalties
  const findings: PatternFinding[] = [];
  let penaltyBits = 0;
  const lower = password.toLowerCase();

  // Check top breached list
  if (TOP_BREACHED_PASSWORDS.has(lower)) {
    findings.push({
      type: 'breached',
      severity: 'critical',
      title: 'Common Breached Password',
      description: 'Matches one of the most frequently exposed passwords in historical database leaks.',
      penaltyBits: 45,
      match: password
    });
    penaltyBits += 45;
  }

  // Check common substrings
  for (const word of COMMON_SUBSTRINGS) {
    if (lower.includes(word) && !findings.some(f => f.type === 'breached')) {
      findings.push({
        type: 'dictionary',
        severity: 'warning',
        title: `Predictable Dictionary Word: "${word}"`,
        description: 'Attackers use targeted dictionary and hybrid wordlist attacks that test common root words instantly.',
        penaltyBits: 20,
        match: word
      });
      penaltyBits += 20;
      break;
    }
  }

  // Check Keyboard walks
  for (const walk of KEYBOARD_WALKS) {
    for (let i = 0; i <= walk.length - 4; i++) {
      const sub = walk.substring(i, i + 4);
      if (lower.includes(sub)) {
        findings.push({
          type: 'keyboard_walk',
          severity: 'warning',
          title: `Keyboard Row Walk: "${sub}"`,
          description: 'Contiguous keys on QWERTY keyboards are systematically prioritized by cracking utilities.',
          penaltyBits: 18,
          match: sub
        });
        penaltyBits += 18;
        break;
      }
    }
    if (findings.some(f => f.type === 'keyboard_walk')) break;
  }

  // Check Sequential numbers / letters (e.g., 1234, abcd)
  const sequentialMatch = /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i.exec(lower);
  if (sequentialMatch) {
    findings.push({
      type: 'sequential',
      severity: 'warning',
      title: `Sequential Run: "${sequentialMatch[0]}"`,
      description: 'Sequential characters decrease effective combinations exponentially.',
      penaltyBits: 15,
      match: sequentialMatch[0]
    });
    penaltyBits += 15;
  }

  // Check Repeated characters (e.g., aaaa, 1111)
  const repeatMatch = /(.)\1{2,}/.exec(password);
  if (repeatMatch) {
    findings.push({
      type: 'repeated',
      severity: 'info',
      title: `Repeated Sequence: "${repeatMatch[0]}"`,
      description: 'Consecutive repeated characters do not contribute meaningful search entropy.',
      penaltyBits: 10,
      match: repeatMatch[0]
    });
    penaltyBits += 10;
  }

  // Check Leetspeak substitution
  const normalized = normalizeLeet(password);
  if (normalized !== lower) {
    for (const word of COMMON_SUBSTRINGS) {
      if (normalized.includes(word) && !lower.includes(word)) {
        findings.push({
          type: 'leetspeak',
          severity: 'warning',
          title: `Leetspeak Masking: "${word}"`,
          description: `Substituting symbols for vowels (e.g. "@" for "a") is trivial for modern rule-based hashcat masks.`,
          penaltyBits: 15,
          match: word
        });
        penaltyBits += 15;
        break;
      }
    }
  }

  // Check Predictable structure: Word + Number + Symbol (e.g. Password1!)
  if (/^[A-Z][a-z]+[0-9]{1,4}[!@#$%^&*]$/.test(password)) {
    findings.push({
      type: 'predictable_pattern',
      severity: 'warning',
      title: 'Predictable Policy Mask: Capital + Word + Digits + Symbol',
      description: 'This exact structure is the #1 tested mask in hash cracking benchmarks, bypassing nominal policy rules.',
      penaltyBits: 20
    });
    penaltyBits += 20;
  }

  // 4. Calculate Effective Entropy
  // Small passwords receive length penalties
  let effectiveEntropy = Math.max(0, theoreticalEntropy - penaltyBits);
  if (length < 8) {
    effectiveEntropy = Math.min(effectiveEntropy, length * 3);
  }

  // 5. Determine Strength Tier & Labels
  let strengthTier: 0 | 1 | 2 | 3 | 4 = 0;
  let strengthLabel: PasswordAnalysis['strengthLabel'] = 'Critically Vulnerable';

  if (effectiveEntropy < 28) {
    strengthTier = 0;
    strengthLabel = 'Critically Vulnerable';
  } else if (effectiveEntropy < 45) {
    strengthTier = 1;
    strengthLabel = 'Weak';
  } else if (effectiveEntropy < 65) {
    strengthTier = 2;
    strengthLabel = 'Moderate';
  } else if (effectiveEntropy < 85) {
    strengthTier = 3;
    strengthLabel = 'Strong';
  } else {
    strengthTier = 4;
    strengthLabel = 'Cryptographically Fortified';
  }

  const scorePercent = Math.min(100, Math.max(4, Math.round((effectiveEntropy / 90) * 100)));

  // 6. Threat Model Crack Times
  // Number of average guesses = 2^(effectiveEntropy - 1)
  const combinations = Math.pow(2, effectiveEntropy);
  const averageGuesses = combinations / 2;

  const crackTimes: Record<string, { seconds: number; formatted: string }> = {};
  for (const tm of THREAT_MODELS) {
    const sec = averageGuesses / tm.guessesPerSecond;
    crackTimes[tm.id] = {
      seconds: sec,
      formatted: formatCrackDuration(sec)
    };
  }

  // 7. Compliance Verification
  const nistReqs = [
    { label: 'Minimum 8 characters (15+ recommended)', passed: length >= 8 },
    { label: 'Free of common breached words', passed: !findings.some(f => f.type === 'breached') },
    { label: 'No simplistic repetitive sequences', passed: !findings.some(f => f.type === 'repeated') }
  ];
  const nistPassed = nistReqs.every(r => r.passed);

  const charClassCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  const pciReqs = [
    { label: 'Minimum 12 characters (PCI-DSS 4.0)', passed: length >= 12 },
    { label: 'Contains both alphabetic and numeric', passed: (hasLower || hasUpper) && hasDigit },
    { label: 'Multi-class diversity (at least 3 types)', passed: charClassCount >= 3 }
  ];
  const pciPassed = pciReqs.every(r => r.passed);

  // 8. Actionable Suggestions
  const suggestions: string[] = [];
  if (length < 12) {
    suggestions.push(`Increase length from ${length} to 15+ characters. Length expands search spaces exponentially ($R^L$).`);
  }
  if (!hasSymbol && !hasUpper) {
    suggestions.push('Introduce varied character classes or switch to a 4-word Diceware passphrase.');
  }
  if (findings.some(f => f.type === 'keyboard_walk' || f.type === 'sequential')) {
    suggestions.push('Eliminate sequential keys or number walks (e.g., "1234", "qwerty").');
  }
  if (findings.some(f => f.type === 'predictable_pattern')) {
    suggestions.push('Avoid the standard pattern (TitleCase + number + symbol) which is targeted by mask cracking scripts.');
  }
  if (effectiveEntropy >= 75 && suggestions.length === 0) {
    suggestions.push('Excellent cryptographic resilience. Highly resistant to offline and online attacks.');
  }

  return {
    length,
    charPool: {
      hasLower,
      hasUpper,
      hasDigit,
      hasSymbol,
      hasUnicode,
      poolSize,
      breakdown
    },
    shannonEntropy: Math.round(theoreticalEntropy * 10) / 10,
    effectiveEntropy: Math.round(effectiveEntropy * 10) / 10,
    strengthTier,
    strengthLabel,
    scorePercent,
    findings,
    crackTimes,
    compliance: {
      nist800_63b: { passed: nistPassed, requirements: nistReqs },
      pciDss4: { passed: pciPassed, requirements: pciReqs }
    },
    suggestions
  };
}
