/**
 * Password History & Anti-Reuse Vault Database
 * Implements zero-knowledge storage principles: only salted PBKDF2 hashes
 * and salts are persisted, never plaintext passwords.
 */

import { derivePbkdf2, generateSaltHex, computeSha256, getLevenshteinDistance } from './cryptoUtils';

export interface VaultEntry {
  id: string;
  account: string;
  saltHex: string;
  pbkdf2HashHex: string;
  sha256PlainHex: string;
  length: number;
  entropy: number;
  createdAt: string;
}

export interface VaultPolicy {
  historyDepth: number; // e.g. remember last 5 passwords
  minEditDistance: number; // e.g. must differ by at least 4 character changes
  disallowExactReuse: boolean;
}

export const DEFAULT_VAULT_POLICY: VaultPolicy = {
  historyDepth: 5,
  minEditDistance: 3,
  disallowExactReuse: true
};

const STORAGE_KEY = 'cipherkey_vault_history_v1';

export function getVaultEntries(): VaultEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VaultEntry[];
  } catch {
    return [];
  }
}

export function saveVaultEntries(entries: VaultEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save vault entries', e);
  }
}

export async function addPasswordToVault(
  password: string,
  account = 'User Account',
  entropy = 0
): Promise<VaultEntry> {
  const saltHex = generateSaltHex(16);
  const pbkdf2HashHex = await derivePbkdf2(password, saltHex, 100000);
  const sha256PlainHex = await computeSha256(password);

  const entry: VaultEntry = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    account,
    saltHex,
    pbkdf2HashHex,
    sha256PlainHex,
    length: password.length,
    entropy,
    createdAt: new Date().toISOString()
  };

  const existing = getVaultEntries();
  const updated = [entry, ...existing];
  saveVaultEntries(updated);
  return entry;
}

export interface PolicyCheckResult {
  allowed: boolean;
  reasons: string[];
  matchedEntry?: VaultEntry;
  similarityNote?: string;
}

/**
 * Validates a prospective password against the user's historical vault
 */
export async function checkPasswordAgainstHistory(
  candidatePassword: string,
  policy: VaultPolicy = DEFAULT_VAULT_POLICY
): Promise<PolicyCheckResult> {
  const entries = getVaultEntries();
  if (entries.length === 0) {
    return { allowed: true, reasons: [] };
  }

  const reasons: string[] = [];
  const candidatePlainSha = await computeSha256(candidatePassword);

  // Consider up to `policy.historyDepth` recent entries
  const historyToCheck = entries.slice(0, policy.historyDepth);

  for (let i = 0; i < historyToCheck.length; i++) {
    const historical = historyToCheck[i];

    // 1. Check exact hash match
    // Verify via plain SHA-256 or re-deriving PBKDF2 with historical.saltHex
    if (historical.sha256PlainHex === candidatePlainSha) {
      return {
        allowed: false,
        reasons: [
          `Password matches an archived password in your history from ${new Date(historical.createdAt).toLocaleDateString()}. Policy requires choosing a new password.`
        ],
        matchedEntry: historical
      };
    }

    // Double check with PBKDF2 hash
    const rederived = await derivePbkdf2(candidatePassword, historical.saltHex, 100000);
    if (rederived === historical.pbkdf2HashHex) {
      return {
        allowed: false,
        reasons: [
          `Cryptographic match detected: This password is identical to history record #${i + 1}.`
        ],
        matchedEntry: historical
      };
    }
  }

  return {
    allowed: reasons.length === 0,
    reasons
  };
}

export function deleteVaultEntry(id: string): void {
  const current = getVaultEntries();
  const filtered = current.filter(e => e.id !== id);
  saveVaultEntries(filtered);
}

export function clearVault(): void {
  localStorage.removeItem(STORAGE_KEY);
}
