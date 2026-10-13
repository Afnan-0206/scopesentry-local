import React, { useState } from 'react';
import { ScopeAssessment } from '@scopesentry/shared';
import { StoredProject } from '../types.js';
import { StorageService } from '../services/storage.service.js';
import { ApiService } from '../services/api.service.js';
import { StatusBadge } from '../components/StatusBadge.js';
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Quote,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  DollarSign,
  Calendar,
  RefreshCw,
  FileText
} from 'lucide-react';

interface Props {
  project: StoredProject;
  assessment: ScopeAssessment;
  isDemoMode: boolean;
  onBackToCompare: () => void;
}

export const AssessmentResultsPage: React.FC<Props> = ({
  project,
  assessment,
  isDemoMode,
  onBackToCompare,
}) => {
  const [editableDraft, setEditableDraft] = useState(assessment.draftReply);
  const [proposedFee, setProposedFee] = useState('');
  const [proposedTimeline, setProposedTimeline] = useState('');
  const [userCustomNote, setUserCustomNote] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdatingDraft, setIsUpdatingDraft] = useState(false);

  const verifiedQuotes = assessment.supportingQuotations.filter((q) => q.isVerified);
  const unverifiedQuotes = assessment.supportingQuotations.filter((q) => !q.isVerified);

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(editableDraft);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = StorageService.exportAssessmentMarkdown(project, {
      ...assessment,
      draftReply: editableDraft,
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.projectName.toLowerCase().replace(/\s+/g, '_')}_assessment.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonStr = StorageService.exportProjectJson(project);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.projectName.toLowerCase().replace(/\s+/g, '_')}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateDraft = async () => {
    setIsUpdatingDraft(true);
    try {
      const res = await ApiService.draftReply(
        {
          assessment,
          proposedFee: proposedFee.trim(),
          proposedTimeline: proposedTimeline.trim(),
          userCustomNote: userCustomNote.trim(),
        },
        isDemoMode
      );
      setEditableDraft(res.draftReply);
    } catch (e: any) {
      console.error('Failed to update draft:', e);
    } finally {
      setIsUpdatingDraft(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCompare}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Assessment Results</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {project.projectName}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Evaluated on {new Date(assessment.evaluatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportMarkdown}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="Download formatted Markdown summary"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handleExportJson}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="Download full project JSON"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Primary Status Banner */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={assessment.primaryStatus} size="lg" />
            <span className="text-xs text-slate-400 font-medium">Scope Boundary Evaluation</span>
          </div>

          <button
            onClick={onBackToCompare}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium self-start sm:self-auto"
          >
            Check Another Request →
          </button>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {assessment.shortSummary}
        </p>

        {/* Suggested Next Step Callout */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-xs">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Recommended Next Step: </span>
            <span className="text-slate-300">{assessment.suggestedNextStep}</span>
          </div>
        </div>
      </div>

      {/* Warnings & Citations Flagged */}
      {assessment.evidenceValidationWarnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <span>Evidence Verification Alerts</span>
          </div>
          <ul className="space-y-1 text-amber-200/90">
            {assessment.evidenceValidationWarnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Two Column Section: Identified Changes vs Verified Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Requested Changes Identified */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Client Changes Identified</span>
          </h2>

          <ul className="space-y-2 text-xs">
            {assessment.requestedChangesIdentified.map((item, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300"
              >
                • {item}
              </li>
            ))}
          </ul>

          {assessment.missingOrAmbiguousInfo.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <p className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ambiguities to Clarify:</span>
              </p>
              <ul className="text-xs text-sky-300/90 space-y-1">
                {assessment.missingOrAmbiguousInfo.map((amb, idx) => (
                  <li key={idx}>• {amb}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Verified Source Evidence */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Source Agreement Evidence</span>
          </h2>

          {verifiedQuotes.length > 0 ? (
            <div className="space-y-3 text-xs">
              {verifiedQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded bg-slate-950/80 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-start gap-2 text-slate-300 italic font-mono text-[11px] leading-relaxed">
                    <Quote className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>"{q.quote}"</span>
                  </div>
                  {q.whyItMatters && (
                    <p className="text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-300">Why it matters:</span> {q.whyItMatters}
                    </p>
                  )}
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-2 py-0.5 rounded">
                      <Check className="w-3 h-3" />
                      <span>Verified verbatim in agreement</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded border border-slate-800/60">
              No direct quotation was verified for this request. Conservative evaluation applied.
            </p>
          )}

          {/* Unverified items list */}
          {unverifiedQuotes.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Unverified Citations Flagged:</span>
              </p>
              {unverifiedQuotes.map((uq) => (
                <div key={uq.id} className="p-2 rounded bg-amber-950/30 border border-amber-900/40 text-xs text-amber-200">
                  <p className="italic">"{uq.quote}"</p>
                  <p className="text-[10px] text-amber-400 mt-1">{uq.warning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggested Professional Reply Section */}
      <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>Client Reply Draft</span>
              <span className="text-xs font-normal text-slate-400">
                (Professional, non-confrontational, editable)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and customize before sending. ScopeSentry never sends client messages automatically.
            </p>
          </div>

          <button
            onClick={handleCopyClipboard}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition self-start sm:self-auto"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Draft</span>
              </>
            )}
          </button>
        </div>

        {/* Optional Custom Controls (Safeguard: only included if user enters them!) */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3">
          <p className="text-xs font-medium text-slate-300">
            Optional Freelancer Customizations (will be included in draft without hallucinated prices):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Proposed Additional Fee:</span>
              </label>
              <input
                type="text"
                value={proposedFee}
                onChange={(e) => setProposedFee(e.target.value)}
                placeholder="e.g. $450 or $85/hr for 6 hours"
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Proposed Timeline Adjustment:</span>
              </label>
              <input
                type="text"
                value={proposedTimeline}
                onChange={(e) => setProposedTimeline(e.target.value)}
                placeholder="e.g. 3 additional business days"
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 text-xs">
              Personal Note to Add to Message:
            </label>
            <input
              type="text"
              value={userCustomNote}
              onChange={(e) => setUserCustomNote(e.target.value)}
              placeholder="e.g. I have time starting this Thursday to tackle this."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpdateDraft}
              disabled={isUpdatingDraft}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingDraft ? 'animate-spin' : ''}`} />
              <span>Update Draft with Options</span>
            </button>
          </div>
        </div>

        {/* Editable Message Textarea */}
        <textarea
          rows={10}
          value={editableDraft}
          onChange={(e) => setEditableDraft(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
        />
      </div>
    </div>
  );
};
