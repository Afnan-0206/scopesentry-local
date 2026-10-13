import React, { useState, useEffect } from 'react';
import { BackendHealth, ApiService } from '../services/api.service.js';
import { StorageService } from '../services/storage.service.js';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Trash2,
  ShieldCheck,
  Zap,
  Info,
  Server
} from 'lucide-react';

interface Props {
  health: BackendHealth | null;
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
  onRefreshHealth: () => void;
  onDataCleared: () => void;
}

export const SettingsPage: React.FC<Props> = ({
  health,
  isDemoMode,
  onToggleDemoMode,
  onRefreshHealth,
  onDataCleared,
}) => {
  const [models, setModels] = useState<string[]>([]);
  const [configuredModel, setConfiguredModel] = useState('qwen2.5:7b');
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const res = await ApiService.getModels();
        setModels(res.models || []);
        setConfiguredModel(res.configured || 'qwen2.5:7b');
      } catch {
        // Handled silently
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, [health]);

  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all locally stored projects and assessments? This action cannot be undone.'
      )
    ) {
      StorageService.clearAllData();
      onDataCleared();
      alert('All locally stored application data has been cleared.');
    }
  };

  const isOllamaRunning = Boolean(health?.ollama?.isRunning);

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Local AI & System Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your local inference engine, model status, and device privacy boundaries.
        </p>
      </div>

      {/* Mode Switch Card */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Inference Execution Mode</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose between live local Ollama inference or deterministic prerecorded demo fixtures.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onToggleDemoMode(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                !isDemoMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Ollama
            </button>
            <button
              onClick={() => onToggleDemoMode(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                isDemoMode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demo Fixtures
            </button>
          </div>
        </div>

        {isDemoMode && (
          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Demo Fixtures Mode Active:</strong> Allows evaluating all 6 screens and workflows without downloading Ollama or AI models. Clearly flagged as prerecorded sample data.
            </span>
          </div>
        )}
      </div>

      {/* Local Ollama Status Card */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Local Ollama Server Status</span>
          </h2>

          <button
            onClick={onRefreshHealth}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition flex items-center gap-1 text-xs"
            title="Refresh status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-medium">Daemon Status</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              {isOllamaRunning ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">Online & Responding</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold text-rose-300">Offline / Unreachable</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-medium">Ollama Version</span>
            <p className="font-mono text-slate-200 pt-0.5">
              {health?.ollama?.version ? `v${health.ollama.version}` : 'Unknown'}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-medium">Configured Model</span>
            <p className="font-mono text-slate-200 pt-0.5">
              {configuredModel}
            </p>
          </div>
        </div>

        {/* Installed Models List */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Installed Compatible Models ({models.length}):
          </label>
          {models.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {models.map((m) => (
                <span
                  key={m}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md border ${
                    m === configuredModel
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  {m} {m === configuredModel && '★ Active'}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {isLoadingModels ? 'Loading model list...' : 'No models detected on 127.0.0.1:11434.'}
            </p>
          )}
        </div>
      </div>

      {/* Windows PowerShell Setup & Troubleshooting Guide */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>Local Ollama Setup (PowerShell)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Run these commands in Windows PowerShell to verify or pull your local model:
        </p>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div>
            <p className="text-slate-500"># 1. Verify Ollama is running and responding</p>
            <p className="text-emerald-400">curl http://127.0.0.1:11434/api/tags</p>
          </div>
          <div>
            <p className="text-slate-500"># 2. Check installed models</p>
            <p className="text-emerald-400">ollama list</p>
          </div>
          <div>
            <p className="text-slate-500"># 3. Pull preferred model (Qwen 2.5 7B)</p>
            <p className="text-emerald-400">ollama pull qwen2.5:7b</p>
          </div>
          <div>
            <p className="text-slate-500"># Optional: Lightweight model for quick testing</p>
            <p className="text-emerald-400">ollama pull qwen2.5:0.5b</p>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee & Storage Cleanup */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privacy & Local Storage</span>
        </h2>

        <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
          <p>
            • <strong>Loopback Privacy:</strong> The backend is strictly bound to <code>127.0.0.1</code>. No agreement text or client requests are transmitted to cloud AI vendors or analytics services.
          </p>
          <p>
            • <strong>Storage Notice:</strong> Project history is stored in your browser's <code>localStorage</code> for ease of access. Local storage is unencrypted; do not use on shared public computers.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Clear stored projects and assessments:</span>
          <button
            onClick={handleClearData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-medium rounded-lg border border-rose-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
