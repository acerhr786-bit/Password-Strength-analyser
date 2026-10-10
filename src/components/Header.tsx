import React from 'react';
import { ShieldCheck, KeyRound, Database, BookOpen, Sparkles } from 'lucide-react';

export type NavTab = 'analyzer' | 'generator' | 'vault' | 'cryptolab';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onQuickAudit }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <a
              href="#analyzer"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('analyzer');
              }}
              className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap"
            >
              CipherKey
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onTabChange('analyzer')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'analyzer'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Strength Analyzer
            </button>
            <button
              onClick={() => onTabChange('generator')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'generator'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Passphrase Generator
            </button>
            <button
              onClick={() => onTabChange('vault')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'vault'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              Anti-Reuse Vault
            </button>
            <button
              onClick={() => onTabChange('cryptolab')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'cryptolab'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Cryptography Lab
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onQuickAudit}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-emerald-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Test Sample Key
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-900 text-xs">
          <button
            onClick={() => onTabChange('analyzer')}
            className={`py-1 px-2 ${activeTab === 'analyzer' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            Analyzer
          </button>
          <button
            onClick={() => onTabChange('generator')}
            className={`py-1 px-2 ${activeTab === 'generator' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            Generator
          </button>
          <button
            onClick={() => onTabChange('vault')}
            className={`py-1 px-2 ${activeTab === 'vault' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            Vault
          </button>
          <button
            onClick={() => onTabChange('cryptolab')}
            className={`py-1 px-2 ${activeTab === 'cryptolab' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            Crypto Lab
          </button>
        </div>
      </div>
    </header>
  );
};
