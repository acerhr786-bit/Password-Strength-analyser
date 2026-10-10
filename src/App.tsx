/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, NavTab } from './components/Header';
import { AnalyzerView } from './components/AnalyzerView';
import { GeneratorView } from './components/GeneratorView';
import { VaultView } from './components/VaultView';
import { CryptoLabView } from './components/CryptoLabView';
import { addPasswordToVault } from './lib/vaultHistory';
import { CheckCircle2, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('analyzer');
  const [currentAuditPassword, setCurrentAuditPassword] = useState('P@$$w0rd2024!');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleQuickAudit = () => {
    const samples = [
      'Tr0ub4dor&3',
      'correct-horse-battery-staple',
      'admin123456!',
      'kF9#vX2$mQ8!pL4^jR7&',
      'DragonMaster99#'
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setCurrentAuditPassword(picked);
    setActiveTab('analyzer');
    showToast(`Loaded test credential "${picked.slice(0, 10)}..."`);
  };

  const handleSendToVault = async (pwd: string, entropy: number) => {
    try {
      await addPasswordToVault(pwd, 'Analyzed Candidate', entropy);
      showToast('Password hash safely registered into zero-knowledge vault history.');
    } catch {
      showToast('Failed to save password to vault.');
    }
  };

  const handleAnalyzePassword = (pwd: string) => {
    setCurrentAuditPassword(pwd);
    setActiveTab('analyzer');
    showToast('Loaded credential into Strength Audit Engine.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 border border-emerald-500/40 text-emerald-300 rounded-lg shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAudit={handleQuickAudit}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'analyzer' && (
          <AnalyzerView
            key={currentAuditPassword}
            initialPassword={currentAuditPassword}
            onSelectSuggestion={(pwd) => setCurrentAuditPassword(pwd)}
            onSendToVault={handleSendToVault}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'generator' && (
          <GeneratorView
            onAnalyzePassword={handleAnalyzePassword}
            onSaveToVault={handleSendToVault}
          />
        )}

        {activeTab === 'vault' && (
          <VaultView
            onAnalyzePassword={handleAnalyzePassword}
          />
        )}

        {activeTab === 'cryptolab' && (
          <CryptoLabView />
        )}
      </main>

      {/* Footer conforming strictly to design constitution */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-600" />
            <span>CipherKey · Client-Side Cryptographic Security Analysis Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Client Web Crypto API</span>
            <span aria-hidden="true">·</span>
            <span>Zero Server Transmission</span>
            <span aria-hidden="true">·</span>
            <span>NIST SP 800-63B / PCI-DSS 4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
