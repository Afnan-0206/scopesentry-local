import React, { useState } from 'react';
import { MAX_AGREEMENT_CHARS } from '@scopesentry/shared';
import { PendingAgreementAnalysis } from '../types.js';
import { ApiService, BackendHealth } from '../services/api.service.js';
import {
  Upload,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Info,
  Zap
} from 'lucide-react';

interface Props {
  isDemoMode: boolean;
  health: BackendHealth | null;
  initialText?: string;
  onAnalysisSuccess: (analysis: PendingAgreementAnalysis) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
  onEnableDemoMode: () => void;
}

export const CreateProjectPage: React.FC<Props> = ({
  isDemoMode,
  health,
  initialText = '',
  onAnalysisSuccess,
  onCancel,
  onOpenSettings,
  onEnableDemoMode,
}) => {
  const [projectName, setProjectName] = useState('');
  const [clientLabel, setClientLabel] = useState('');
  const [originalAgreementText, setOriginalAgreementText] = useState(initialText);
  const [notes, setNotes] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(
    health?.ollama?.configuredModel || 'qwen2.5:7b'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const charCount = originalAgreementText.length;
  const isOverLimit = charCount > MAX_AGREEMENT_CHARS;
  const isOllamaRunning = isDemoMode || Boolean(health?.ollama?.isRunning);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      setErrorMessage('Please upload a plain text (.txt) or Markdown (.md) document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setOriginalAgreementText(content);
        if (!projectName) {
          const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setProjectName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!projectName.trim()) {
      setErrorMessage('Please enter a project title.');
      return;
    }

    if (originalAgreementText.trim().length < 10) {
      setErrorMessage('Agreement text must be at least 10 characters.');
      return;
    }

    if (isOverLimit) {
      setErrorMessage(`Agreement text exceeds the ${MAX_AGREEMENT_CHARS} character limit.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.analyzeAgreement(
        {
          projectName: projectName.trim(),
          clientLabel: clientLabel.trim(),
          originalAgreementText: originalAgreementText.trim(),
          notes: notes.trim(),
          model: selectedModel,
        },
        isDemoMode
      );

      onAnalysisSuccess({
        projectName: projectName.trim(),
        clientLabel: clientLabel.trim(),
        originalAgreementText: originalAgreementText.trim(),
        notes: notes.trim(),
        extractedScope: response.extractedScope,
        warnings: response.warnings,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract scope from agreement.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleAgreement = () => {
    setProjectName('Modern SaaS Marketing Redesign');
    setClientLabel('CloudFlow Software Inc.');
    setOriginalAgreementText(`PROJECT AGREEMENT & STATEMENT OF WORK
Client: CloudFlow Software Inc.
Scope Deliverables:
1. Complete redesign of the Marketing Website (5 pages: Home, Pricing, Features, Blog List, and Contact).
2. Fully responsive mobile layouts tested on iOS Safari and Chrome.
3. Integration of HubSpot lead capture forms on the Contact page.
4. Tailwind CSS styling with dark/light mode toggle.

Explicit Exclusions:
- User login, authentication, and customer dashboard are strictly out of scope.
- Stripe payment processing or credit card checkout is not included.
- Blog article copywriting (all content provided by CloudFlow).

Revision & Change Policy:
- Scope includes two (2) consolidated rounds of client feedback.
- Requests for new pages or backend architecture will require a formal change order at $95/hour.`);
  };

  return (
    <div className="max-w-[820px] mx-auto py-6 space-y-6 animate-rise">
      {/* Back and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/8">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-[7px] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#111111]">
              New Project Scope
            </h1>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Paste or import your written agreement to extract deliverables and citations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadSampleAgreement}
          className="text-xs px-3 py-1.5 bg-black/4 hover:bg-black/8 text-[#111111] rounded-[9px] border border-black/8 transition self-start sm:self-auto"
        >
          Load Example Brief
        </button>
      </div>

      {/* Model offline warning banner */}
      {!isOllamaRunning && (
        <div className="p-4 rounded-[14px] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">Local Ollama Service Unreachable</p>
            <p className="text-[#5c5c5c]">
              Ollama does not appear to be running at <code>http://127.0.0.1:11434</code>. You can start Ollama locally, or test immediately using <strong>Demo Fixtures Mode</strong>.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onEnableDemoMode}
                className="font-medium text-amber-800 underline hover:text-amber-950"
              >
                Switch to Demo Fixtures Mode →
              </button>
              <button
                type="button"
                onClick={onOpenSettings}
                className="font-medium text-[#5c5c5c] hover:text-[#111111]"
              >
                View Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#fafbf9] p-6 sm:p-8 rounded-[20px] border border-black/8 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Acme Brand Redesign"
              className="w-full bg-white border border-black/10 rounded-[9px] px-3.5 py-2.5 text-sm text-[#111111] placeholder-[#888888] focus:outline-none focus:border-black transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">
              Client Name / Label <span className="text-[#5c5c5c] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={clientLabel}
              onChange={(e) => setClientLabel(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-white border border-black/10 rounded-[9px] px-3.5 py-2.5 text-sm text-[#111111] placeholder-[#888888] focus:outline-none focus:border-black transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[#111111]">
              Original Agreement or Statement of Work <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer text-xs text-[#111111] hover:underline flex items-center gap-1 font-medium transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Import .txt / .md</span>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span
                className={`text-[11px] font-mono ${
                  isOverLimit ? 'text-rose-600 font-bold' : 'text-[#5c5c5c]'
                }`}
              >
                {charCount.toLocaleString()} / {MAX_AGREEMENT_CHARS.toLocaleString()}
              </span>
            </div>
          </div>

          <textarea
            required
            rows={11}
            value={originalAgreementText}
            onChange={(e) => setOriginalAgreementText(e.target.value)}
            placeholder="Paste the written deliverables, exclusions, revisions, constraints, or signed proposal here..."
            className={`w-full bg-white border rounded-[12px] p-4 text-xs font-mono text-[#111111] placeholder-[#888888] focus:outline-none transition leading-relaxed ${
              isOverLimit ? 'border-rose-500' : 'border-black/10 focus:border-black'
            }`}
          />
          <p className="text-[11px] text-[#5c5c5c] mt-1.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#111111]" />
            <span>
              All analysis is performed 100% locally. Excerpts are deterministically verified verbatim against this text.
            </span>
          </p>
        </div>

        {/* Model Selection and Internal Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5 flex items-center justify-between">
              <span>Inference Model</span>
              <span className="text-[11px] text-[#5c5c5c] font-normal">Local Ollama</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-[9px] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-black transition"
            >
              {health?.ollama?.availableModels?.map((m) => (
                <option key={m} value={m}>
                  {m} {m === 'qwen2.5:0.5b' ? '(Fastest / CPU friendly)' : m === 'qwen2.5:7b' ? '(Recommended default)' : ''}
                </option>
              )) || (
                <>
                  <option value="qwen2.5:7b">qwen2.5:7b (Default)</option>
                  <option value="qwen2.5:0.5b">qwen2.5:0.5b (Fast)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">
              Freelancer Notes <span className="text-[#5c5c5c] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Signed Sep 12. Deposit received."
              className="w-full bg-white border border-black/10 rounded-[9px] px-3.5 py-2 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-black transition"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <p className="font-medium">{errorMessage}</p>
            </div>
            {errorMessage.includes('timed out') && (
              <div className="pt-2 border-t border-rose-200/80 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel('qwen2.5:0.5b');
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1 bg-white border border-rose-300 rounded-[7px] text-[11px] font-medium text-rose-900 hover:bg-rose-100 transition"
                >
                  <Zap className="w-3 h-3 inline mr-1 text-amber-600" />
                  Switch to fast model (qwen2.5:0.5b) & retry
                </button>
                <button
                  type="button"
                  onClick={onEnableDemoMode}
                  className="px-2.5 py-1 bg-white border border-rose-300 rounded-[7px] text-[11px] font-medium text-rose-900 hover:bg-rose-100 transition"
                >
                  Use Demo Fixtures Mode
                </button>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/8">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 text-xs font-medium text-[#5c5c5c] hover:text-[#111111] transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading || isOverLimit || !projectName.trim() || !originalAgreementText.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#141414] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-[9px] shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition duration-150"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isDemoMode ? 'Analyzing Demo Scope...' : `Analyzing Scope with ${selectedModel}...`}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Agreement Scope</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
