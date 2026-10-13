import React from 'react';
import { Shield, Plus, Settings, FolderKanban } from 'lucide-react';
import { AppView } from '../types.js';
import { BackendHealth } from '../services/api.service.js';
import { LocalStatusBadge } from './LocalStatusBadge.js';

interface Props {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  health: BackendHealth | null;
  isDemoMode: boolean;
}

export const Header: React.FC<Props> = ({ currentView, onNavigate, health, isDemoMode }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div
          onClick={() => onNavigate('projects')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 tracking-tight text-base">ScopeSentry</span>
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                Local
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Freelance Scope Assistant</p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3">
          <LocalStatusBadge
            health={health}
            isDemoMode={isDemoMode}
            onOpenSettings={() => onNavigate('settings')}
          />

          <nav className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => onNavigate('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                currentView === 'projects'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Projects</span>
            </button>

            <button
              onClick={() => onNavigate('create')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
                currentView === 'create' || currentView === 'review'
                  ? 'bg-brand-600 text-white'
                  : 'bg-emerald-600/90 text-white hover:bg-emerald-500'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Scope</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`p-1.5 text-slate-400 hover:text-slate-200 rounded-md transition ${
                currentView === 'settings' ? 'bg-slate-800 text-slate-100' : 'hover:bg-slate-800/50'
              }`}
              title="Settings & Local AI Status"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
