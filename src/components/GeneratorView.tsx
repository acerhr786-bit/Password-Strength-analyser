import React, { useState } from 'react';
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Sliders,
  Database
} from 'lucide-react';
import {
  generatePassphrase,
  generateCryptoString,
  generatePin,
  PassphraseOptions,
  CryptoStringOptions
} from '../lib/passwordGenerator';
import { analyzePassword } from '../lib/passwordAnalysis';

interface GeneratorViewProps {
  onAnalyzePassword: (pwd: string) => void;
  onSaveToVault: (pwd: string, entropy: number) => void;
}

type GeneratorMode = 'passphrase' | 'cryptostring' | 'pin';

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  onAnalyzePassword,
  onSaveToVault
}) => {
  const [mode, setMode] = useState<GeneratorMode>('passphrase');
  const [copied, setCopied] = useState(false);

  // Passphrase Options State
  const [passphraseOpts, setPassphraseOpts] = useState<PassphraseOptions>({
    wordCount: 4,
    separator: '-',
    capitalizeWords: true,
    includeNumber: true,
    includeSymbol: false
  });

  // Crypto String Options State
  const [cryptoOpts, setCryptoOpts] = useState<CryptoStringOptions>({
    length: 18,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true
  });

  // PIN length
  const [pinLength, setPinLength] = useState<number>(6);

  // Current Generated Output
  const [generatedPassword, setGeneratedPassword] = useState<string>(() =>
    generatePassphrase(passphraseOpts)
  );

  const handleRegenerate = () => {
    if (mode === 'passphrase') {
      setGeneratedPassword(generatePassphrase(passphraseOpts));
    } else if (mode === 'cryptostring') {
      setGeneratedPassword(generateCryptoString(cryptoOpts));
    } else {
      setGeneratedPassword(generatePin(pinLength));
    }
  };

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const analysis = analyzePassword(generatedPassword);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Strong Alternative Generator
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Generate mathematically resilient credentials using standard Diceware algorithms or high-entropy pseudo-random permutations.
        </p>
      </div>

      {/* Main Generator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        {/* Output Display Canvas */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Generated Credential</span>
            <div className="flex items-center gap-2">
              <span>{generatedPassword.length} characters</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-400 font-semibold">{analysis.effectiveEntropy} bits entropy</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="font-mono text-lg sm:text-xl font-bold text-white tracking-wide break-all select-all">
              {generatedPassword}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRegenerate}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-lg font-semibold text-xs transition-colors shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
          </div>

          {/* Action Row Under Output */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Assessment: <strong className="text-white">{analysis.strengthLabel}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Cracking time: <strong className="text-slate-300 font-mono">{analysis.crackTimes['offline_single_gpu']?.formatted}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAnalyzePassword(generatedPassword)}
                className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
              >
                Analyze in Audit Engine
              </button>
              <button
                type="button"
                onClick={() => onSaveToVault(generatedPassword, analysis.effectiveEntropy)}
                className="px-2.5 py-1 text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-950/70 rounded border border-emerald-800/50 transition flex items-center gap-1"
              >
                <Database className="w-3 h-3" />
                Store in Vault
              </button>
            </div>
          </div>
        </div>

        {/* Generator Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('passphrase');
              setGeneratedPassword(generatePassphrase(passphraseOpts));
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'passphrase'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diceware Passphrase
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('cryptostring');
              setGeneratedPassword(generateCryptoString(cryptoOpts));
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'cryptostring'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Random Character String
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('pin');
              setGeneratedPassword(generatePin(pinLength));
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'pin'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Numeric PIN
          </button>
        </div>

        {/* Controls based on active mode */}
        {mode === 'passphrase' && (
          <div className="space-y-5 bg-slate-950/50 p-5 rounded-lg border border-slate-800">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
                <span>Number of Words</span>
                <span className="font-mono text-emerald-400 tabular-nums">{passphraseOpts.wordCount} words</span>
              </div>
              <input
                type="range"
                min="3"
                max="6"
                value={passphraseOpts.wordCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const updated = { ...passphraseOpts, wordCount: val };
                  setPassphraseOpts(updated);
                  setGeneratedPassword(generatePassphrase(updated));
                }}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>3 words (~45 bits)</span>
                <span>4 words (~68 bits, Recommended)</span>
                <span>5 words (~85 bits)</span>
                <span>6 words (~102 bits)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Separator</label>
                <select
                  value={passphraseOpts.separator}
                  onChange={(e) => {
                    const updated = { ...passphraseOpts, separator: e.target.value };
                    setPassphraseOpts(updated);
                    setGeneratedPassword(generatePassphrase(updated));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value=".">Period (.)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=" ">Space ( )</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={passphraseOpts.capitalizeWords}
                  onChange={(e) => {
                    const updated = { ...passphraseOpts, capitalizeWords: e.target.checked };
                    setPassphraseOpts(updated);
                    setGeneratedPassword(generatePassphrase(updated));
                  }}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                />
                <span>Capitalize each word</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={passphraseOpts.includeNumber}
                  onChange={(e) => {
                    const updated = { ...passphraseOpts, includeNumber: e.target.checked };
                    setPassphraseOpts(updated);
                    setGeneratedPassword(generatePassphrase(updated));
                  }}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                />
                <span>Append 2-digit number</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={passphraseOpts.includeSymbol}
                  onChange={(e) => {
                    const updated = { ...passphraseOpts, includeSymbol: e.target.checked };
                    setPassphraseOpts(updated);
                    setGeneratedPassword(generatePassphrase(updated));
                  }}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900"
                />
                <span>Append special symbol</span>
              </label>
            </div>
          </div>
        )}

        {mode === 'cryptostring' && (
          <div className="space-y-5 bg-slate-950/50 p-5 rounded-lg border border-slate-800">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
                <span>Password Length</span>
                <span className="font-mono text-emerald-400 tabular-nums">{cryptoOpts.length} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="48"
                value={cryptoOpts.length}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const updated = { ...cryptoOpts, length: val };
                  setCryptoOpts(updated);
                  setGeneratedPassword(generateCryptoString(updated));
                }}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>8 (Minimum)</span>
                <span>16 (Standard)</span>
                <span>24 (Fortified)</span>
                <span>48 (Master Key)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={cryptoOpts.uppercase}
                  onChange={(e) => {
                    const updated = { ...cryptoOpts, uppercase: e.target.checked };
                    setCryptoOpts(updated);
                    setGeneratedPassword(generateCryptoString(updated));
                  }}
                  className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                />
                <span>Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={cryptoOpts.lowercase}
                  onChange={(e) => {
                    const updated = { ...cryptoOpts, lowercase: e.target.checked };
                    setCryptoOpts(updated);
                    setGeneratedPassword(generateCryptoString(updated));
                  }}
                  className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                />
                <span>Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={cryptoOpts.numbers}
                  onChange={(e) => {
                    const updated = { ...cryptoOpts, numbers: e.target.checked };
                    setCryptoOpts(updated);
                    setGeneratedPassword(generateCryptoString(updated));
                  }}
                  className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={cryptoOpts.symbols}
                  onChange={(e) => {
                    const updated = { ...cryptoOpts, symbols: e.target.checked };
                    setCryptoOpts(updated);
                    setGeneratedPassword(generateCryptoString(updated));
                  }}
                  className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                />
                <span>Symbols (!@#$)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={cryptoOpts.excludeAmbiguous}
                  onChange={(e) => {
                    const updated = { ...cryptoOpts, excludeAmbiguous: e.target.checked };
                    setCryptoOpts(updated);
                    setGeneratedPassword(generateCryptoString(updated));
                  }}
                  className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                />
                <span>Avoid Ambiguous</span>
              </label>
            </div>
          </div>
        )}

        {mode === 'pin' && (
          <div className="space-y-4 bg-slate-950/50 p-5 rounded-lg border border-slate-800">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
                <span>PIN Digits</span>
                <span className="font-mono text-emerald-400 tabular-nums">{pinLength} digits</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                value={pinLength}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setPinLength(val);
                  setGeneratedPassword(generatePin(val));
                }}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>4 (ATM PIN)</span>
                <span>6 (Two-Factor / Authenticator)</span>
                <span>8 (Extended)</span>
                <span>12 (Hardware Token)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Educational Concept Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-2">
          Why Passphrases Beat Short Complex Strings (XKCD 936 Principle)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200">The Problem with Traditional Rules</h3>
            <p className="text-slate-400">
              Arbitrary complexity rules (mandating 1 uppercase, 1 number, 1 symbol) prompt humans to choose predictable structures like <code className="text-rose-300">P@ssword1!</code>. While it checks all the regulatory boxes, automated GPU masks crack it in milliseconds because the search space is limited to predictable permutations.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200">The Mathematics of Passphrases</h3>
            <p className="text-slate-400">
              A 4-word Diceware passphrase selected randomly from a dictionary of 2,000 words yields $2000^4 \approx 1.6 \times 10^{13}$ permutations ($\approx 44$ bits of pure word entropy). Adding separators and digits easily pushes entropy beyond 75 bits—giving you superhuman defense against brute force while remaining trivial to type and memorize.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
