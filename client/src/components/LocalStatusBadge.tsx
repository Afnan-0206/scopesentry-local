import { AlertCircle } from 'lucide-react';
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
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition shadow-sm"
        title="Demo Fixtures Mode is currently active. Click to view Settings."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span>Demo Fixtures</span>
      </button>
    );
  }

  const isOllamaRunning = health?.ollama?.isRunning;
  const modelName = health?.ollama?.configuredModel || 'qwen2.5:7b';

  return (
    <button
      onClick={onOpenSettings}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition shadow-sm ${
        isOllamaRunning
          ? 'bg-white/80 text-[#111111] border-black/8 hover:bg-white'
          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
      }`}
      title={
        isOllamaRunning
          ? `Ollama online (${modelName}) on 127.0.0.1:11434`
          : 'Ollama is offline or unreachable. Click for settings.'
      }
    >
      {isOllamaRunning ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{modelName}</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Ollama Offline</span>
        </>
      )}
    </button>
  );
};
