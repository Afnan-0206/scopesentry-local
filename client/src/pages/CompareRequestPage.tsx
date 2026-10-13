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
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{project.projectName}</span>
              {project.clientLabel && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {project.clientLabel}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Check a new client message against the approved scope agreement.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowScopeDrawer(!showScopeDrawer)}
          className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>View Approved Scope ({project.approvedScope.deliverables.length})</span>
          {showScopeDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isOllamaRunning && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Ollama appears offline. Switch to Demo Fixtures in Settings if you wish to test with sample data.</span>
        </div>
      )}

      {/* Scope Drawer Collapsible */}
      {showScopeDrawer && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3">
          <h3 className="font-semibold text-slate-200">Approved Agreement Reference:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-slate-400 font-medium mb-1">Agreed Deliverables:</p>
              <ul className="space-y-1 text-slate-300">
                {project.approvedScope.deliverables.map((d) => (
                  <li key={d.id}>• {d.text}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-amber-400 font-medium mb-1">Explicit Exclusions:</p>
              <ul className="space-y-1 text-amber-200/90">
                {project.approvedScope.explicitExclusions.length > 0 ? (
                  project.approvedScope.explicitExclusions.map((e) => <li key={e.id}>• {e.text}</li>)
                ) : (
                  <li className="text-slate-500 italic">None expressly listed</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300">
            Paste Client Message or Requested Changes <span className="text-emerald-400">*</span>
          </label>
          <span
            className={`text-[11px] font-mono ${
              isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-500'
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
          placeholder="Paste the email, Slack message, or list of requested features from the client..."
          className={`w-full bg-slate-950 border rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition leading-relaxed ${
            isOverLimit ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
          }`}
        />

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500">Test quick scenarios:</span>
          <button
            type="button"
            onClick={() => handleQuickSample('included')}
            className="text-[11px] px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border border-slate-700 transition"
          >
            Agreed Deliverable
          </button>
          <button
            type="button"
            onClick={() => handleQuickSample('excluded')}
            className="text-[11px] px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-amber-400 border border-slate-700 transition"
          >
            Unagreed Feature (Auth/Payments)
          </button>
          <button
            type="button"
            onClick={() => handleQuickSample('ambiguous')}
            className="text-[11px] px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-sky-400 border border-slate-700 transition"
          >
            Vague Requirement
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading || isOverLimit || clientRequestText.trim().length < 5}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isDemoMode ? 'Analyzing Demo Fixture...' : 'Comparing Locally with Ollama...'}
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
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Previous Assessments ({project.assessments.length})</span>
          </h2>

          <div className="space-y-2">
            {project.assessments.map((assess, index) => (
              <div
                key={assess.id}
                onClick={() => onAssessmentCompleted(project, index)}
                className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={assess.primaryStatus} size="sm" />
                    <span className="text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(assess.evaluatedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium line-clamp-1">{assess.shortSummary}</p>
                </div>

                <span className="text-emerald-400 font-medium shrink-0 self-start sm:self-auto">
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
