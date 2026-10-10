import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Lock,
  Key,
  Check,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import {
  VaultEntry,
  getVaultEntries,
  addPasswordToVault,
  checkPasswordAgainstHistory,
  deleteVaultEntry,
  clearVault,
  PolicyCheckResult,
  DEFAULT_VAULT_POLICY
} from '../lib/vaultHistory';
import { analyzePassword } from '../lib/passwordAnalysis';

interface VaultViewProps {
  onAnalyzePassword?: (pwd: string) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ onAnalyzePassword }) => {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [candidatePassword, setCandidatePassword] = useState('');
  const [candidateAccount, setCandidateAccount] = useState('Primary Work Account');
  const [checkResult, setCheckResult] = useState<PolicyCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getVaultEntries());
  }, []);

  // Check candidate password against historical vault entries
  useEffect(() => {
    if (!candidatePassword) {
      setCheckResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await checkPasswordAgainstHistory(candidatePassword, DEFAULT_VAULT_POLICY);
        setCheckResult(res);
      } finally {
        setIsChecking(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [candidatePassword, entries]);

  const handleAddCandidate = async () => {
    if (!candidatePassword.trim()) return;
    setIsAdding(true);
    try {
      const analysis = analyzePassword(candidatePassword);
      await addPasswordToVault(candidatePassword, candidateAccount, analysis.effectiveEntropy);
      setEntries(getVaultEntries());
      setCandidatePassword('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSeedDemoHistory = async () => {
    clearVault();
    const demoItems = [
      { pwd: 'Spring2023!#', acc: 'Corporate SSO Login', ent: 42 },
      { pwd: 'Summer2023$%', acc: 'Internal VPN Gateway', ent: 44 },
      { pwd: 'Autumn2023@9', acc: 'Payroll Portal', ent: 46 },
      { pwd: 'Winter2024#1', acc: 'Active Directory User', ent: 45 },
      { pwd: 'Glacier-Summit-Falcon-84', acc: 'Cloud Console Root', ent: 76 }
    ];

    for (const item of demoItems) {
      await addPasswordToVault(item.pwd, item.acc, item.ent);
    }
    setEntries(getVaultEntries());
  };

  const handleClear = () => {
    clearVault();
    setEntries([]);
    setCheckResult(null);
  };

  const handleDelete = (id: string) => {
    deleteVaultEntry(id);
    setEntries(getVaultEntries());
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Zero-Knowledge Anti-Reuse Vault
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Simulate enterprise credential rotation policies. Enforce password history rules cryptographically without storing plaintext credentials.
        </p>
      </div>

      {/* Conceptual Zero-Knowledge Explainer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <h2 className="text-sm font-bold text-white">How Zero-Knowledge Password History Works</h2>
            <p className="text-slate-400">
              When an organization enforces a rule like <strong className="text-slate-200">"Cannot reuse any of your last 5 passwords"</strong>, storing previous passwords in plaintext would create a catastrophic target for database exfiltration.
            </p>
            <p className="text-slate-400">
              Instead, modern security systems persist a unique cryptographically random 16-byte <strong className="text-emerald-400">Salt</strong> alongside a slow key derivation output (<strong className="text-emerald-400">PBKDF2-HMAC-SHA256</strong> with 100,000 iterations). When you propose a new password, the system hashes your candidate against your previous salts to verify uniqueness—meaning the server never knows what your old passwords were!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Anti-Reuse Policy Testing Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Test Password Against Rotation Policy
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSeedDemoHistory}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition"
            >
              Seed Enterprise Demo History
            </button>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded transition"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Candidate New Password to Test
            </label>
            <input
              type="text"
              value={candidatePassword}
              onChange={(e) => setCandidatePassword(e.target.value)}
              placeholder="e.g. Try typing 'Spring2023!#' or a new passphrase..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Account Label / Realm
            </label>
            <input
              type="text"
              value={candidateAccount}
              onChange={(e) => setCandidateAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Real-time Policy Validation Result */}
        {candidatePassword && (
          <div className="pt-2">
            {checkResult ? (
              checkResult.allowed ? (
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-xs flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 text-emerald-300">
                    <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Policy Compliant: Password Accepted</div>
                      <div className="text-emerald-200/80 mt-0.5">
                        Zero matches against your historical salted hash records (checked across {Math.min(DEFAULT_VAULT_POLICY.historyDepth, entries.length)} archived entries).
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCandidate}
                    disabled={isAdding}
                    className="shrink-0 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded font-semibold text-xs transition"
                  >
                    {isAdding ? 'Deriving...' : 'Register to Vault'}
                  </button>
                </div>
              ) : (
                <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 text-xs flex items-start gap-2.5 text-rose-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <div className="font-semibold">Policy Violation: Reused Password Rejected</div>
                    <div className="text-rose-200/90 mt-0.5">
                      {checkResult.reasons[0]}
                    </div>
                  </div>
                </div>
              )
            ) : isChecking ? (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Computing PBKDF2 iterations against stored salt registry...</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* History Database Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Persisted Salted Hashes in Vault
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice: Plaintext passwords are not stored. Only salts, PBKDF2 hash digests, and cryptographic metadata exist.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {entries.length} records in storage
          </span>
        </div>

        {entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Account / Realm</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Salt (16-byte Hex)</th>
                  <th className="py-2.5 px-3 font-semibold">Derived PBKDF2 Hash</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-3 font-sans text-white font-medium">
                      {entry.account}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-emerald-400/90 max-w-[140px] truncate">
                      {entry.saltHex}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[200px] truncate">
                      {entry.pbkdf2HashHex}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2 font-sans">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(entry.pbkdf2HashHex, entry.id)}
                          className="p-1 text-slate-400 hover:text-slate-200 transition"
                          title="Copy hash"
                        >
                          {copiedHash === entry.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Key className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-8 text-center text-xs space-y-3">
            <Database className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-slate-300 font-medium">No Vault History Records</div>
            <p className="text-slate-400 max-w-sm mx-auto">
              Click &quot;Seed Enterprise Demo History&quot; or register a candidate password to simulate how organizations check and prevent password reuse.
            </p>
            <button
              type="button"
              onClick={handleSeedDemoHistory}
              className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-semibold rounded text-xs transition"
            >
              Seed 5 Sample Passwords
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
