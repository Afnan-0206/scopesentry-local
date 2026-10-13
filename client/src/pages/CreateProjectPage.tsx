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
  Info
} from 'lucide-react';

interface Props {
  isDemoMode: boolean;
  health: BackendHealth | null;
  onAnalysisSuccess: (analysis: PendingAgreementAnalysis) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
}

export const CreateProjectPage: React.FC<Props> = ({
  isDemoMode,
  health,
  onAnalysisSuccess,
  onCancel,
  onOpenSettings,
}) => {
  const [projectName, setProjectName] = useState('');
  const [clientLabel, setClientLabel] = useState('');
  const [originalAgreementText, setOriginalAgreementText] = useState('');
  const [notes, setNotes] = useState('');
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
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Back and Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Create New Project Agreement</h1>
            <p className="text-xs text-slate-400">
              Paste or import your original proposal, brief, or contract to extract verified deliverables.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadSampleAgreement}
          className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
        >
          Load Example Brief
        </button>
      </div>

      {/* Model offline warning banner */}
      {!isOllamaRunning && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-100">Local Ollama Service Unreachable</p>
            <p>
              Ollama does not appear to be running at <code>http://127.0.0.1:11434</code>. You can start Ollama locally, or switch to <strong>Demo Fixtures Mode</strong> in Settings to test without live inference.
            </p>
            <button
              onClick={onOpenSettings}
              className="text-amber-400 underline font-medium hover:text-amber-300 inline-block mt-1"
            >
              Open Settings & Troubleshooting →
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900/60 p-6 rounded-xl border border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Project Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Acme Brand Redesign"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Client Name / Label <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={clientLabel}
              onChange={(e) => setClientLabel(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">
              Original Agreement or Statement of Work <span className="text-emerald-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition">
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
                  isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-500'
                }`}
              >
                {charCount.toLocaleString()} / {MAX_AGREEMENT_CHARS.toLocaleString()}
              </span>
            </div>
          </div>

          <textarea
            required
            rows={12}
            value={originalAgreementText}
            onChange={(e) => setOriginalAgreementText(e.target.value)}
            placeholder="Paste the written scope, deliverables list, exclusions, contract clauses, or project brief here..."
            className={`w-full bg-slate-950 border rounded-lg p-3 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition leading-relaxed ${
              isOverLimit ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
            }`}
          />
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>
              All text is processed strictly on your local machine. Citations will be verified verbatim against this text.
            </span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Internal Freelancer Notes <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Deposit paid on 10/12, wire transfer reference #382."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/60">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading || isOverLimit || !projectName.trim() || !originalAgreementText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isDemoMode ? 'Analyzing Demo Fixture...' : 'Analyzing with Local Ollama...'}
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
