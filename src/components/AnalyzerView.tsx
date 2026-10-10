import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Server,
  Zap,
  Info,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  analyzePassword,
  THREAT_MODELS,
  PasswordAnalysis
} from '../lib/passwordAnalysis';
import { checkBreachKAnonymity, BreachCheckResult } from '../lib/cryptoUtils';
import { generateAlternativeSuggestions, GeneratedSuggestion } from '../lib/passwordGenerator';

interface AnalyzerViewProps {
  initialPassword?: string;
  onSelectSuggestion?: (pwd: string) => void;
  onSendToVault?: (pwd: string, entropy: number) => void;
  onNavigateToTab?: (tab: 'generator' | 'vault' | 'cryptolab') => void;
}

const SAMPLE_PRESETS = [
  { label: 'Common Breached', value: '123456', hint: 'Top leak in history' },
  { label: 'Keyboard Walk', value: 'qwerty12345', hint: 'Contiguous keys' },
  { label: 'Leetspeak Mask', value: 'P@$$w0rd2024!', hint: 'Trivial mask' },
  { label: 'Diceware Passphrase', value: 'Falcon-Glacier-Summit-94', hint: 'Memorable high entropy' },
  { label: 'Cryptographic 24-char', value: 'kF9#vX2$mQ8!pL4^jR7&tY3*', hint: 'Astronomical search space' }
];

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  initialPassword = '',
  onSelectSuggestion,
  onSendToVault,
  onNavigateToTab
}) => {
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedThreatModel, setSelectedThreatModel] = useState(THREAT_MODELS[2].id); // default fast GPU
  const [breachResult, setBreachResult] = useState<BreachCheckResult | null>(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [suggestions, setSuggestions] = useState<GeneratedSuggestion[]>([]);

  const analysis: PasswordAnalysis = analyzePassword(password);

  // Update suggestions whenever password changes
  useEffect(() => {
    setSuggestions(generateAlternativeSuggestions(password));
  }, [password]);

  // Check breach k-anonymity on debounced input
  useEffect(() => {
    if (!password || password.trim().length === 0) {
      setBreachResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingBreach(true);
      try {
        const result = await checkBreachKAnonymity(password);
        setBreachResult(result);
      } catch {
        setBreachResult(null);
      } finally {
        setIsCheckingBreach(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [password]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierColorClass = (tier: number) => {
    switch (tier) {
      case 0:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 1:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 2:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 3:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 4:
        return 'text-teal-300 bg-teal-500/10 border-teal-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getMeterColor = (tier: number) => {
    switch (tier) {
      case 0: return 'bg-rose-500';
      case 1: return 'bg-amber-500';
      case 2: return 'bg-yellow-400';
      case 3: return 'bg-emerald-400';
      case 4: return 'bg-teal-400';
      default: return 'bg-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header Section */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Password Strength & Cryptographic Resilience
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Analyze Shannon entropy ($H = L \log_2 R$), inspect heuristic pattern penalties, test cracking speeds across threat models, and check breach exposure via k-Anonymity.
        </p>
      </div>

      {/* Primary Input Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-2">
          <label htmlFor="password-input" className="text-sm font-semibold text-slate-200">
            Password Under Audit
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{password.length} characters</span>
            <span aria-hidden="true">·</span>
            <span>{analysis.charPool.poolSize} charset pool</span>
          </div>
        </div>

        {/* Input bar */}
        <div className="relative flex items-center">
          <input
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password or select a preset below..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3.5 pl-4 pr-24 font-mono text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition"
            autoComplete="off"
            spellCheck="false"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!password}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-md transition-colors disabled:opacity-30"
              title="Copy to clipboard"
              aria-label="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Educational Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-2">
            Try benchmark cases to explore cryptographic behavior:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPassword(preset.value)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
              >
                {preset.label}
              </button>
            ))}
            {password && (
              <button
                type="button"
                onClick={() => setPassword('')}
                className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded transition-colors ml-auto"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Strength Rating Bar & Meta */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Strength Assessment:</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getTierColorClass(analysis.strengthTier)}`}>
                {analysis.strengthLabel}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Theoretical: <strong className="font-mono text-slate-200 tabular-nums">{analysis.shannonEntropy}</strong> bits</span>
              <span aria-hidden="true">·</span>
              <span>Effective: <strong className="font-mono text-emerald-400 tabular-nums">{analysis.effectiveEntropy}</strong> bits</span>
            </div>
          </div>

          {/* Segmented meter */}
          <div className="grid grid-cols-5 gap-1.5 h-2">
            {[0, 1, 2, 3, 4].map((step) => {
              const isActive = password.length > 0 && analysis.strengthTier >= step;
              return (
                <div
                  key={step}
                  className={`rounded-full transition-all duration-300 ${
                    isActive ? getMeterColor(analysis.strengthTier) : 'bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Action buttons under meter */}
          {password && onSendToVault && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <p className="text-slate-400">
                {analysis.suggestions[0]}
              </p>
              <button
                type="button"
                onClick={() => onSendToVault(password, analysis.effectiveEntropy)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors"
              >
                Save to Anti-Reuse Vault
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Effective Entropy</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {analysis.effectiveEntropy}
            </span>
            <span className="text-xs text-slate-400">bits</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Search space: <span className="font-mono text-slate-300">2^{analysis.effectiveEntropy}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Character Pool Size (R)</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {analysis.charPool.poolSize}
            </span>
            <span className="text-xs text-slate-400">symbols</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">
            {analysis.charPool.breakdown.length > 0 ? analysis.charPool.breakdown.join(', ') : 'None'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Length Multiplier (L)</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {analysis.length}
            </span>
            <span className="text-xs text-slate-400">chars</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {analysis.length >= 15 ? 'Meets NIST recommendation' : 'Under 15 chars recommendation'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Heuristic Pattern Penalty</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              -{Math.round((analysis.shannonEntropy - analysis.effectiveEntropy) * 10) / 10}
            </span>
            <span className="text-xs text-slate-400">bits</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {analysis.findings.length} vulnerability patterns detected
          </div>
        </div>
      </div>

      {/* Split: Threat Model Simulator & Pattern Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Threat Model Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Brute Force Time-to-Crack Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate estimated recovery time across different attacker computing capabilities.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('cryptolab')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Learn Math <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Model Selector segmented buttons */}
          <div className="space-y-2">
            {THREAT_MODELS.map((model) => {
              const isSelected = selectedThreatModel === model.id;
              const crackTime = analysis.crackTimes[model.id]?.formatted || '0 seconds';
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedThreatModel(model.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {model.name}
                      </span>
                      <span className="text-xs text-slate-500">· {model.speedDescription}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{model.notes}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-mono text-sm font-bold tabular-nums ${
                      model.id.includes('gpu') && (crackTime.includes('ms') || crackTime.includes('seconds') || crackTime.includes('Instant'))
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}>
                      {password ? crackTime : '—'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Threat Model Explanation Box */}
          {(() => {
            const activeModel = THREAT_MODELS.find(m => m.id === selectedThreatModel);
            const time = analysis.crackTimes[selectedThreatModel]?.formatted || '0 seconds';
            if (!activeModel) return null;
            return (
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Selected Threat Scenario:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{activeModel.name}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <span className="text-slate-400">Projected Time to Exhaust Average Search Space:</span>
                  <span className="font-mono text-sm font-bold text-white tabular-nums">{password ? time : 'Enter password'}</span>
                </div>
                <p className="text-slate-400 text-xs pt-1 leading-relaxed">
                  Formula: T = 2^(H_eff - 1) / (guesses/sec). At {activeModel.speedDescription}, searching through {analysis.effectiveEntropy} bits of effective entropy requires traversing approximately 2^{Math.max(0, Math.round(analysis.effectiveEntropy - 1))} combinations on average.
                </p>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Pattern Warnings & k-Anonymity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* k-Anonymity Breach Check Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Zero-Knowledge Breach Exposure
              </h3>
              {isCheckingBreach && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />}
            </div>

            {breachResult ? (
              breachResult.breached ? (
                <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Compromised in Known Leaks</span>
                  </div>
                  <p className="text-rose-200/90 leading-relaxed">
                    This password appears {breachResult.count.toLocaleString()} times in breached credential databases. Automated stuffing bots will crack it in milliseconds.
                  </p>
                  <div className="font-mono text-slate-400 text-xs pt-1 border-t border-rose-900/50">
                    k-Anonymity Prefix: <span className="text-rose-300">{breachResult.sha1Prefix}</span> (only 5 chars sent over wire)
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>No Exposure in Breach Dumps</span>
                  </div>
                  <p className="text-emerald-200/90 leading-relaxed">
                    Checked via SHA-1 k-Anonymity against 1+ billion compromised passwords. Not detected in public corpus.
                  </p>
                  <div className="font-mono text-slate-400 text-xs pt-1 border-t border-emerald-900/50">
                    Query Prefix: <span className="text-emerald-300">{breachResult.sha1Prefix}</span> · Client-side hash match
                  </div>
                </div>
              )
            ) : (
              <div className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                Type a password to verify exposure against historical breach dictionaries using zero-knowledge k-Anonymity.
              </div>
            )}
          </div>

          {/* Pattern Recognition Findings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Pattern & Heuristic Analysis
            </h3>

            {analysis.findings.length > 0 ? (
              <div className="space-y-2.5">
                {analysis.findings.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {f.title}
                      </span>
                      <span className="font-mono text-amber-400 tabular-nums">
                        -{f.penaltyBits} bits
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed pl-5">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : password ? (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero predictable keyboard walks, sequences, or dictionary stems detected.</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Pattern detector will highlight keyboard walks, repeated clusters, and predictable masks.
              </div>
            )}
          </div>

          {/* Standards Compliance Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">
              Regulatory Security Audits
            </h3>
            <div className="space-y-4 text-xs">
              {/* NIST SP 800-63B */}
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-200">NIST SP 800-63B Guidelines</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    analysis.compliance.nist800_63b.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {analysis.compliance.nist800_63b.passed ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
                <div className="space-y-1 text-slate-400">
                  {analysis.compliance.nist800_63b.requirements.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {r.passed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 flex items-center justify-center text-rose-400 shrink-0">✕</span>
                      )}
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PCI-DSS 4.0 */}
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-200">PCI-DSS 4.0 Requirement 8</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    analysis.compliance.pciDss4.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {analysis.compliance.pciDss4.passed ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
                <div className="space-y-1 text-slate-400">
                  {analysis.compliance.pciDss4.requirements.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {r.passed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 flex items-center justify-center text-rose-400 shrink-0">✕</span>
                      )}
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Alternatives Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Suggested Stronger Alternatives
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mathematically sound replacements that resist offline GPU cluster cracking.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('generator')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Custom Generator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-emerald-400">{item.label}</span>
                  <span className="text-xs font-mono text-slate-400 tabular-nums">~{item.estimatedBits} bits</span>
                </div>
                <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 font-mono text-xs text-slate-200 select-all break-all mb-2">
                  {item.password}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setPassword(item.password);
                    if (onSelectSuggestion) onSelectSuggestion(item.password);
                  }}
                  className="flex-1 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium transition-colors"
                >
                  Apply to Audit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(item.password);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
