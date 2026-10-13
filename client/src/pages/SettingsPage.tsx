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
  Server,
  Globe
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
  const [configuredModel, setConfiguredModel] = useState(
    health?.ollama?.configuredModel || 'qwen2.5:7b'
  );
  const [customApiUrl, setCustomApiUrl] = useState(() => StorageService.getCustomApiUrl());
  const [apiSaveNotice, setApiSaveNotice] = useState<string | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelSwitchNotice, setModelSwitchNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const res = await ApiService.getModels();
        setModels(res.models || []);
        if (res.configured) setConfiguredModel(res.configured);
      } catch {
        // Handled silently
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, [health]);

  const handleSelectModel = async (modelName: string) => {
    setConfiguredModel(modelName);
    try {
      await fetch('/api/models/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName }),
      });
      setModelSwitchNotice(`Switched active local model to ${modelName}`);
      onRefreshHealth();
      setTimeout(() => setModelSwitchNotice(null), 3000);
    } catch {
      // Ignored
    }
  };

  const handleSaveCustomApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.setCustomApiUrl(customApiUrl);
    setApiSaveNotice(customApiUrl ? `Configured backend endpoint: ${customApiUrl}` : 'Reset backend endpoint to same-origin /api');
    onRefreshHealth();
    setTimeout(() => setApiSaveNotice(null), 3500);
  };

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
    <div className="max-w-[820px] mx-auto py-6 space-y-6 animate-rise">
      <div className="pb-6 border-b border-black/8">
        <h1 className="text-2xl font-medium tracking-tight text-[#111111]">
          System & Local AI Settings
        </h1>
        <p className="text-xs text-[#5c5c5c] mt-0.5">
          Monitor your local inference engine, model configurations, and device privacy boundaries.
        </p>
      </div>

      {modelSwitchNotice && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{modelSwitchNotice}</span>
        </div>
      )}

      {apiSaveNotice && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{apiSaveNotice}</span>
        </div>
      )}

      {/* Mode Switch Card */}
      <div className="p-6 rounded-[20px] bg-[#fafbf9] border border-black/8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Inference Execution Mode</span>
            </h2>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Choose between live local Ollama inference or deterministic prerecorded demo fixtures.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-[9px] border border-black/6 self-start sm:self-auto">
            <button
              onClick={() => onToggleDemoMode(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[7px] transition ${
                !isDemoMode
                  ? 'bg-white text-[#111111] shadow-sm font-semibold'
                  : 'text-[#5c5c5c] hover:text-[#111111]'
              }`}
            >
              Live Ollama
            </button>
            <button
              onClick={() => onToggleDemoMode(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[7px] transition ${
                isDemoMode
                  ? 'bg-[#141414] text-white shadow-sm font-semibold'
                  : 'text-[#5c5c5c] hover:text-[#111111]'
              }`}
            >
              Demo Fixtures
            </button>
          </div>
        </div>

        {isDemoMode && (
          <div className="p-3.5 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Demo Fixtures Mode Active:</strong> Enables instant evaluation across all workflows without loading models into RAM or requiring an active Ollama daemon.
            </span>
          </div>
        )}
      </div>

      {/* Cloudflare & Remote Backend Endpoint Card */}
      <div className="p-6 rounded-[20px] bg-[#fafbf9] border border-black/8 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Backend Endpoint & Cloudflare Tunnel</span>
          </h2>
          <p className="text-xs text-[#5c5c5c] mt-0.5">
            When deployed on Cloudflare Pages, connect to your local Ollama server securely via a Cloudflare Tunnel or custom API endpoint.
          </p>
        </div>

        <form onSubmit={handleSaveCustomApiUrl} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              placeholder="e.g. https://scopesentry-tunnel.yourdomain.com (or empty for same-origin /api)"
              className="flex-1 bg-white border border-black/10 rounded-[9px] px-3 py-2 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-black font-mono"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#141414] hover:bg-black text-white text-xs font-medium rounded-[9px] shadow-sm transition"
              >
                Save Endpoint
              </button>
              {customApiUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomApiUrl('');
                    StorageService.setCustomApiUrl('');
                    setApiSaveNotice('Reset backend endpoint to same-origin /api');
                    onRefreshHealth();
                    setTimeout(() => setApiSaveNotice(null), 3000);
                  }}
                  className="px-3 py-2 bg-white hover:bg-black/5 text-[#5c5c5c] hover:text-[#111111] text-xs font-medium rounded-[9px] border border-black/10 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-[#777777]">
            Active endpoint:{' '}
            <code className="bg-black/5 px-1.5 py-0.5 rounded text-[#111111]">
              {ApiService.getBaseUrl() || '(same-origin /api)'}
            </code>
          </p>
        </form>
      </div>

      {/* Local Ollama Status Card */}
      <div className="p-6 rounded-[20px] bg-[#fafbf9] border border-black/8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#111111]" />
            <span>Local Ollama Server Status</span>
          </h2>

          <button
            onClick={onRefreshHealth}
            className="p-1.5 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-[7px] transition flex items-center gap-1 text-xs"
            title="Refresh status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-[12px] bg-white border border-black/8 space-y-1">
            <span className="text-[#5c5c5c] font-medium text-[11px]">Daemon Status</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              {isOllamaRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-emerald-800">Online & Responding</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-semibold text-rose-800">Offline / Unreachable</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-[12px] bg-white border border-black/8 space-y-1">
            <span className="text-[#5c5c5c] font-medium text-[11px]">Ollama Version</span>
            <p className="font-mono text-[#111111] pt-0.5 font-medium">
              {health?.ollama?.version ? `v${health.ollama.version}` : 'Unknown'}
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-white border border-black/8 space-y-1">
            <span className="text-[#5c5c5c] font-medium text-[11px]">Active Model</span>
            <p className="font-mono text-[#111111] pt-0.5 font-medium">
              {configuredModel}
            </p>
          </div>
        </div>

        {/* Installed Models Selector */}
        <div>
          <label className="block text-xs font-medium text-[#111111] mb-2">
            Installed Models ({models.length}) — Click to switch active model:
          </label>
          {models.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {models.map((m) => (
                <button
                  key={m}
                  onClick={() => handleSelectModel(m)}
                  className={`px-3 py-1 text-xs font-mono rounded-[8px] border transition ${
                    m === configuredModel
                      ? 'bg-[#141414] text-white border-black font-semibold'
                      : 'bg-white text-[#333333] border-black/10 hover:border-black/30'
                  }`}
                >
                  {m} {m === configuredModel && '★ Active'}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5c5c5c] italic">
              {isLoadingModels ? 'Loading model list...' : 'No models detected on 127.0.0.1:11434.'}
            </p>
          )}
        </div>
      </div>

      {/* Windows PowerShell Setup & Troubleshooting Guide */}
      <div className="p-6 rounded-[20px] bg-[#fafbf9] border border-black/8 shadow-sm space-y-3.5">
        <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#111111]" />
          <span>Local Ollama Commands (PowerShell)</span>
        </h2>
        <p className="text-xs text-[#5c5c5c]">
          Useful commands to inspect or pull local models:
        </p>

        <div className="bg-white p-4 rounded-[12px] border border-black/8 font-mono text-xs text-[#333333] space-y-2.5">
          <div>
            <p className="text-[#888888]"># 1. Verify Ollama is running</p>
            <p className="text-[#111111] font-semibold">curl http://127.0.0.1:11434/api/tags</p>
          </div>
          <div>
            <p className="text-[#888888]"># 2. List installed models</p>
            <p className="text-[#111111] font-semibold">ollama list</p>
          </div>
          <div>
            <p className="text-[#888888]"># 3. Pull preferred model (Qwen 2.5 7B)</p>
            <p className="text-[#111111] font-semibold">ollama pull qwen2.5:7b</p>
          </div>
          <div>
            <p className="text-[#888888]"># 4. Pull fast test model (Qwen 2.5 0.5B)</p>
            <p className="text-[#111111] font-semibold">ollama pull qwen2.5:0.5b</p>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee & Storage Cleanup */}
      <div className="p-6 rounded-[20px] bg-[#fafbf9] border border-black/8 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Privacy & Local Storage</span>
        </h2>

        <div className="space-y-2 text-xs text-[#5c5c5c] leading-relaxed">
          <p>
            • <strong>Loopback Privacy:</strong> The backend binds strictly to <code>127.0.0.1</code>. No agreement text or client requests are transmitted to cloud AI vendors or analytics services.
          </p>
          <p>
            • <strong>Storage Notice:</strong> Project history is stored in browser <code>localStorage</code> for offline convenience.
          </p>
        </div>

        <div className="pt-2 border-t border-black/8 flex items-center justify-between">
          <span className="text-xs text-[#5c5c5c]">Clear stored projects and assessments:</span>
          <button
            onClick={handleClearData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium rounded-[8px] border border-rose-200 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
