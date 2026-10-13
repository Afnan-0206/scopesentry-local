import React, { useState } from 'react';
import { MAX_REQUEST_CHARS } from '@scopesentry/shared';
import { StoredProject } from '../types.js';
import { ApiService, BackendHealth } from '../services/api.service.js';
import { StorageService } from '../services/storage.service.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  Clock,
  History,
  ChevronDown,
  ChevronUp,
  FileCheck2
} from 'lucide-react';

interface Props {
  project: StoredProject;
  isDemoMode: boolean;
  health: BackendHealth | null;
  onAssessmentCompleted: (project: StoredProject, assessmentIndex: number) => void;
  onBack: () => void;
}

export const CompareRequestPage: React.FC<Props> = ({
  project,
  isDemoMode,
  health,
  onAssessmentCompleted,
  onBack,
}) => {
  const [clientRequestText, setClientRequestText] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(
    health?.ollama?.configuredModel || 'qwen2.5:7b'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showScopeDrawer, setShowScopeDrawer] = useState(false);

  const charCount = clientRequestText.length;
  const isOverLimit = charCount > MAX_REQUEST_CHARS;
  const isOllamaRunning = isDemoMode || Boolean(health?.ollama?.isRunning);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (clientRequestText.trim().length < 5) {
      setErrorMessage('Please enter at least 5 characters for the client request.');
      return;
    }

    if (isOverLimit) {
      setErrorMessage(`Request text exceeds maximum of ${MAX_REQUEST_CHARS} characters.`);
      return;
    }

    setIsLoading(true);
    try {
      const assessment = await ApiService.compareRequest(
        {
          projectId: project.id,
          originalAgreementText: project.originalAgreementText,
          approvedScope: project.approvedScope,
          newClientRequest: clientRequestText.trim(),
          model: selectedModel,
        },
        isDemoMode
      );

      // Save assessment to local project history
      StorageService.addAssessment(project.id, assessment, isDemoMode);
      const updatedProject = StorageService.getProject(project.id, isDemoMode) || {
        ...project,
        assessments: [assessment, ...(project.assessments || [])],
      };

      onAssessmentCompleted(updatedProject, 0);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to compare client request against agreement.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSample = (type: 'included' | 'excluded' | 'ambiguous') => {
    if (type === 'included') {
      const firstDeliv = project.approvedScope.deliverables[0]?.text || 'the home page layout';
      setClientRequestText(`Hi! Could you send over the progress update on ${firstDeliv} as discussed in our project agreement?`);
    } else if (type === 'excluded') {
      setClientRequestText(
        `Hey, we decided we really need a customer login portal and Stripe payment checkout integration so users can purchase directly on the site. Can you add this in?`
      );
    } else {
      setClientRequestText(
        `Since you agreed to complete the website, we also need you to build custom automated marketing pipelines and configure our Google Workspace accounts.`
      );
    }
  };

  return (
    <div className="max-w-[880px] mx-auto py-6 space-y-6 animate-rise">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-[7px] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#111111] flex items-center gap-2">
              <span>{project.projectName}</span>
              {project.clientLabel && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/5 text-[#5c5c5c] font-mono">
                  {project.clientLabel}
                </span>
              )}
            </h1>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Check a new client request against the approved deliverables and exclusions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowScopeDrawer(!showScopeDrawer)}
          className="text-xs px-3.5 py-2 rounded-[9px] bg-white hover:bg-black/4 text-[#111111] border border-black/10 flex items-center gap-2 transition self-start sm:self-auto shadow-sm"
        >
          <FileCheck2 className="w-4 h-4 text-emerald-700" />
          <span>Agreed Scope ({project.approvedScope.deliverables.length})</span>
          {showScopeDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isOllamaRunning && (
        <div className="p-3.5 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
          <span>Ollama is offline. Switch to Demo Fixtures in Settings to test without live inference.</span>
        </div>
      )}

      {/* Scope Drawer Collapsible */}
      {showScopeDrawer && (
        <div className="p-5 rounded-[20px] bg-[#fafbf9] border border-black/8 text-xs space-y-3.5 shadow-sm animate-rise">
          <h3 className="font-semibold text-[#111111]">Approved Agreement Reference:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[#111111] font-medium mb-1.5">Agreed Deliverables:</p>
              <ul className="space-y-1 text-[#5c5c5c]">
                {project.approvedScope.deliverables.map((d) => (
                  <li key={d.id}>• {d.text}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-amber-900 font-medium mb-1.5">Explicit Exclusions:</p>
              <ul className="space-y-1 text-[#5c5c5c]">
                {project.approvedScope.explicitExclusions.length > 0 ? (
                  project.approvedScope.explicitExclusions.map((e) => <li key={e.id}>• {e.text}</li>)
                ) : (
                  <li className="italic text-[#888888]">None expressly listed</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Form */}
      <form onSubmit={handleSubmit} className="bg-[#fafbf9] p-6 sm:p-8 rounded-[20px] border border-black/8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#111111]">
            Client Message or Requested Changes <span className="text-rose-500">*</span>
          </label>
          <span
            className={`text-[11px] font-mono ${
              isOverLimit ? 'text-rose-600 font-bold' : 'text-[#5c5c5c]'
            }`}
          >
            {charCount.toLocaleString()} / {MAX_REQUEST_CHARS.toLocaleString()}
          </span>
        </div>

        <textarea
          required
          rows={6}
          value={clientRequestText}
          onChange={(e) => setClientRequestText(e.target.value)}
          placeholder="Paste the email, Slack message, or feature request from your client..."
          className={`w-full bg-white border rounded-[12px] p-4 text-xs font-sans text-[#111111] placeholder-[#888888] focus:outline-none transition leading-relaxed ${
            isOverLimit ? 'border-rose-500' : 'border-black/10 focus:border-black'
          }`}
        />

        {/* Quick Sample Prompts & Model Option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#5c5c5c]">Test sample:</span>
            <button
              type="button"
              onClick={() => handleQuickSample('included')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 transition"
            >
              Agreed Deliverable
            </button>
            <button
              type="button"
              onClick={() => handleQuickSample('excluded')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 transition"
            >
              Excluded Feature (Auth/Payments)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSample('ambiguous')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition"
            >
              Vague Requirement
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#5c5c5c]">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-white border border-black/10 rounded-[7px] px-2 py-1 text-[11px] text-[#111111] focus:outline-none focus:border-black"
            >
              {health?.ollama?.availableModels?.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              )) || (
                <>
                  <option value="qwen2.5:7b">qwen2.5:7b</option>
                  <option value="qwen2.5:0.5b">qwen2.5:0.5b (Fast)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-3 border-t border-black/8 flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading || isOverLimit || clientRequestText.trim().length < 5}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#141414] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-[9px] shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition duration-150"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isDemoMode ? 'Analyzing Demo Scope...' : `Comparing with ${selectedModel}...`}
                </span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Compare Against Agreement</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* History of Past Assessments */}
      {project.assessments && project.assessments.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-black/8">
          <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <History className="w-4 h-4 text-[#5c5c5c]" />
            <span>Previous Assessments ({project.assessments.length})</span>
          </h2>

          <div className="space-y-2.5">
            {project.assessments.map((assess, index) => (
              <div
                key={assess.id}
                onClick={() => onAssessmentCompleted(project, index)}
                className="p-4 rounded-[16px] bg-[#fafbf9] hover:bg-white border border-black/8 hover:border-black/20 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm hover:shadow"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={assess.primaryStatus} size="sm" />
                    <span className="text-[#5c5c5c] flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" />
                      {new Date(assess.evaluatedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#111111] font-medium line-clamp-1">{assess.shortSummary}</p>
                </div>

                <span className="text-[#111111] font-medium shrink-0 self-start sm:self-auto hover:underline">
                  View Assessment →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
