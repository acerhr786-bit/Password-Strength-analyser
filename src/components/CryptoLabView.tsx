import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Server,
  FileKey,
  Flame,
  Binary
} from 'lucide-react';
import {
  computeSha256,
  computeSha1,
  computeSha512,
  generateSaltHex,
  derivePbkdf2,
  calculateBitDifference
} from '../lib/cryptoUtils';

export const CryptoLabView: React.FC = () => {
  // Module 1: Shannon Entropy state
  const [entropyLength, setEntropyLength] = useState(12);
  const [entropyPool, setEntropyPool] = useState(94); // default full ASCII

  // Module 2: Avalanche Effect state
  const [avalancheInput1, setAvalancheInput1] = useState('SecurityCipher2024');
  const [avalancheInput2, setAvalancheInput2] = useState('SecurityCipher2025');
  const [hash1, setHash1] = useState('');
  const [hash2, setHash2] = useState('');
  const [bitDiff, setBitDiff] = useState({ diffBits: 0, totalBits: 256, percentage: 0 });

  // Module 3: Salt effect state
  const [saltInput, setSaltInput] = useState('MyMasterPassphrase');
  const [activeSalt, setActiveSalt] = useState('a9f4c281e09b1178');
  const [unsaltedHash, setUnsaltedHash] = useState('');
  const [saltedHash, setSaltedHash] = useState('');

  // Update Module 2 hashes
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      const h1 = await computeSha256(avalancheInput1);
      const h2 = await computeSha256(avalancheInput2);
      if (isMounted) {
        setHash1(h1);
        setHash2(h2);
        setBitDiff(calculateBitDifference(h1, h2));
      }
    };
    run();
    return () => { isMounted = false; };
  }, [avalancheInput1, avalancheInput2]);

  // Update Module 3 hashes
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      const unsalted = await computeSha256(saltInput);
      const salted = await computeSha256(saltInput + activeSalt);
      if (isMounted) {
        setUnsaltedHash(unsalted);
        setSaltedHash(salted);
      }
    };
    run();
    return () => { isMounted = false; };
  }, [saltInput, activeSalt]);

  const calculatedEntropy = Math.round(entropyLength * Math.log2(entropyPool) * 10) / 10;
  const totalCombinations = Math.pow(entropyPool, entropyLength);

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Cryptography & Password Security Lab
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Interactive mathematical sandboxes exploring Shannon entropy, hash function avalanche dynamics, rainbow table defense through salting, and zero-knowledge k-Anonymity.
        </p>
      </div>

      {/* Featured Visual Hero Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-10 bg-slate-950/80 backdrop-blur-sm lg:bg-slate-950/90">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold tracking-wide">
                <Shield className="w-4 h-4" />
                FOUNDATIONAL CRYPTOGRAPHIC PRINCIPLES
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                The Mathematics of Modern Credential Protection
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Modern authentication does not depend on secrecy of algorithms. Kerckhoffs&apos;s principle dictates that a cryptographic system must remain secure even if everything about it—except the key itself—is public knowledge.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs">
              <div>
                <div className="text-slate-400">Search Space</div>
                <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">R^L Combinations</div>
              </div>
              <div>
                <div className="text-slate-400">Hash Resistance</div>
                <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">One-Way (Pre-image)</div>
              </div>
              <div>
                <div className="text-slate-400">Rainbow Defense</div>
                <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">Per-User Salts</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src="/src/assets/images/crypto_security_blueprint_1791648874845.jpg"
              alt="Cryptographic security vault blueprint"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-950 lg:via-transparent lg:to-transparent" />
          </div>
        </div>
      </div>

      {/* Module 1: Shannon Entropy Sandbox */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Binary className="w-4 h-4" />
              MODULE 01
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Shannon Information Entropy: H = L · log₂(R)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Claude Shannon&apos;s entropy formula measures the mathematical uncertainty of a randomly generated string in bits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5 bg-slate-950/60 p-5 rounded-lg border border-slate-800">
            {/* Slider 1: Length */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
                <span>Password Length (L)</span>
                <span className="font-mono text-emerald-400 tabular-nums">{entropyLength} characters</span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                value={entropyLength}
                onChange={(e) => setEntropyLength(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>4 chars</span>
                <span>12 (Standard)</span>
                <span>20 (Strong)</span>
                <span>32 (Fortified)</span>
              </div>
            </div>

            {/* Slider 2: Character Pool */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
                <span>Alphabet Pool Size (R)</span>
                <span className="font-mono text-emerald-400 tabular-nums">{entropyPool} possibilities / char</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'Digits Only', pool: 10 },
                  { label: 'Lowercase (a-z)', pool: 26 },
                  { label: 'Alphanumeric', pool: 62 },
                  { label: 'All ASCII (94)', pool: 94 },
                  { label: 'Diceware (2048 words)', pool: 2048 },
                  { label: 'Diceware (7776 words)', pool: 7776 }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setEntropyPool(item.pool)}
                    className={`py-1.5 px-2 rounded border text-left transition-colors ${
                      entropyPool === item.pool
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">R = {item.pool}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Entropy Result Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Resulting Information Entropy:</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {calculatedEntropy} bits
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <div className="text-slate-400">// Calculation Breakdown:</div>
              <div>H = {entropyLength} × log₂({entropyPool})</div>
              <div>H = {entropyLength} × {Math.log2(entropyPool).toFixed(3)}</div>
              <div className="text-emerald-400 font-bold">Total Search Space = 2^{calculatedEntropy} combinations</div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">The Power of Length:</strong> Adding just 4 characters to an alphanumeric string multiplies the search space by <span className="font-mono text-emerald-300">62⁴ ≈ 14.7 Million times</span>. Meanwhile, adding 1 special symbol to a short 8-character password only increases the space by <span className="font-mono text-slate-300">94/62 ≈ 1.5 times</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Module 2: The Avalanche Effect Playground */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <Flame className="w-4 h-4" />
            MODULE 02
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            The Cryptographic Avalanche Effect
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A secure cryptographic hash function must ensure that changing a single input bit flips approximately 50% of the output digest bits unpredictably.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Input String A
            </label>
            <input
              type="text"
              value={avalancheInput1}
              onChange={(e) => setAvalancheInput1(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <div className="mt-2 p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
              <div className="text-[10px] text-slate-400 mb-0.5">SHA-256 Digest:</div>
              {hash1}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Input String B (Change 1 character to observe flip)
            </label>
            <input
              type="text"
              value={avalancheInput2}
              onChange={(e) => setAvalancheInput2(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <div className="mt-2 p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
              <div className="text-[10px] text-slate-400 mb-0.5">SHA-256 Digest:</div>
              {hash2}
            </div>
          </div>
        </div>

        {/* Avalanche Metrics Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400">Differing Output Bits:</span>
            <div className="mt-0.5 font-mono text-base font-bold text-white tabular-nums">
              <span className="text-emerald-400">{bitDiff.diffBits}</span> / {bitDiff.totalBits} bits ({bitDiff.percentage}% divergence)
            </div>
          </div>
          <div className="sm:text-right max-w-sm text-slate-400">
            {bitDiff.percentage >= 40 && bitDiff.percentage <= 60 ? (
              <span className="text-emerald-300 font-medium">
                Ideal Avalanche Behavior (~50%). Demonstrates strict pre-image resistance and mathematical diffusion.
              </span>
            ) : (
              <span>Calculated over 256 bits across 32-byte output digest.</span>
            )}
          </div>
        </div>
      </section>

      {/* Module 3: Rainbow Tables & Salting Defense */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <Layers className="w-4 h-4" />
            MODULE 03
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Why Rainbow Tables Fail Against Per-User Salts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A rainbow table is a precomputed lookup table mapping billions of hashes back to plaintexts in O(1) time. Unique random salts defeat this entirely.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unsalted vs Salted Demonstration */}
          <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Sample Password
              </label>
              <input
                type="text"
                value={saltInput}
                onChange={(e) => setSaltInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 font-mono text-xs text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold">Cryptographic Salt (16-byte random hex)</span>
                <button
                  type="button"
                  onClick={() => setActiveSalt(generateSaltHex(8))}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px]"
                >
                  Generate New Salt
                </button>
              </div>
              <input
                type="text"
                value={activeSalt}
                onChange={(e) => setActiveSalt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 font-mono text-xs text-emerald-400"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-rose-400 font-semibold">1. Unsalted Hash (Vulnerable to Rainbow Tables):</span>
                <div className="font-mono text-[11px] text-slate-400 break-all p-2 bg-slate-900 rounded border border-slate-800 mt-1">
                  {unsaltedHash}
                </div>
              </div>
              <div>
                <span className="text-emerald-400 font-semibold">2. Salted Hash: SHA-256(Password + Salt):</span>
                <div className="font-mono text-[11px] text-emerald-300 break-all p-2 bg-slate-900 rounded border border-slate-800 mt-1">
                  {saltedHash}
                </div>
              </div>
            </div>
          </div>

          {/* Explanatory Architecture Diagram */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col justify-between text-xs space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm mb-2">The Mathematical Defense</h3>
              <p className="text-slate-400 leading-relaxed mb-3">
                If 100,000 users all choose the password <code className="text-slate-200">"Summer2024!"</code>:
              </p>
              <ul className="space-y-2 text-slate-300 list-disc list-inside">
                <li>
                  <strong>Without Salt:</strong> All 100,000 accounts produce the exact same hash digest. A single rainbow table lookup instantly compromises all 100,000 accounts simultaneously.
                </li>
                <li>
                  <strong>With Unique Salt:</strong> Every user receives an independent random salt. Even though they share the same password, each database record contains a completely distinct hash!
                </li>
              </ul>
            </div>

            <div className="p-3 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong>Key Derivation Defense (KDFs):</strong> Modern systems combine salting with slow iteration functions (like <strong>PBKDF2</strong>, <strong>Argon2id</strong>, or <strong>bcrypt</strong>) that artificially require milliseconds per hash, rendering billion-hash-per-second GPU clusters ineffective.
            </div>
          </div>
        </div>
      </section>

      {/* Module 4: k-Anonymity Protocol Architecture */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <Server className="w-4 h-4" />
            MODULE 04
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Zero-Knowledge k-Anonymity Protocol
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            How can a website check if your password was leaked in a breach without learning what your password is?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold font-mono">STEP 1: Hash Client-Side</div>
            <p className="text-slate-400">
              The user&apos;s browser hashes the password locally using SHA-1 (e.g. <code className="text-slate-200">21BD1...3EF8</code>). The plaintext never leaves your machine.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold font-mono">STEP 2: Truncate to Prefix</div>
            <p className="text-slate-400">
              The browser extracts ONLY the first 5 hexadecimal characters of the hash (<code className="text-emerald-300">21BD1</code>).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold font-mono">STEP 3: Query Range API</div>
            <p className="text-slate-400">
              The client requests all breach hashes starting with <code className="text-emerald-300">21BD1</code>. The server returns ~500 hash suffixes without knowing which one is yours.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold font-mono">STEP 4: Local Match</div>
            <p className="text-slate-400">
              The browser checks the remaining 35 characters locally against the returned list. Privacy is 100% preserved!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
