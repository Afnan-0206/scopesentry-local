import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { BackendHealth } from '../services/api.service.js';

interface Props {
  health: BackendHealth | null;
  isDemoMode: boolean;
  onOpenSettings: () => void;
}

export const LocalStatusBadge: React.FC<Props> = ({ health, isDemoMode, onOpenSettings }) => {
  if (isDemoMode) {
    return (
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/60 transition"
        title="Demo Fixtures Mode is currently active. Click to view Settings."
      >
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
        <span>Demo Fixtures Mode</span>
      </button>
    );
  }

  const isOllamaRunning = health?.ollama?.isRunning;
  const modelName = health?.ollama?.configuredModel || 'qwen2.5:7b';

  return (
    <button
      onClick={onOpenSettings}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition ${
        isOllamaRunning
          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/40'
          : 'bg-rose-950/60 text-rose-300 border-rose-800/50 hover:bg-rose-900/40'
      }`}
      title={
        isOllamaRunning
          ? `Ollama online (${modelName}) on 127.0.0.1:11434`
          : 'Ollama is offline or unreachable. Click for settings.'
      }
    >
      {isOllamaRunning ? (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local AI: {modelName}</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Ollama Offline</span>
        </>
      )}
    </button>
  );
};
