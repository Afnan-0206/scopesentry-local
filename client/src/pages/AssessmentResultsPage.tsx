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
    <div className="max-w-[880px] mx-auto py-6 space-y-6 animate-rise">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCompare}
            className="p-1.5 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-[7px] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#111111] flex items-center gap-2">
              <span>Assessment Results</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/5 text-[#5c5c5c] font-mono">
                {project.projectName}
              </span>
            </h1>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Evaluated on {new Date(assessment.evaluatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportMarkdown}
            className="text-xs px-3.5 py-2 rounded-[9px] bg-white hover:bg-black/4 text-[#111111] border border-black/10 flex items-center gap-1.5 transition shadow-sm"
            title="Download formatted Markdown summary"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown</span>
          </button>
          <button
            onClick={handleExportJson}
            className="text-xs px-3.5 py-2 rounded-[9px] bg-white hover:bg-black/4 text-[#111111] border border-black/10 flex items-center gap-1.5 transition shadow-sm"
            title="Download full project JSON"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Primary Status Banner */}
      <div className="p-6 sm:p-7 rounded-[20px] bg-[#fafbf9] border border-black/8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StatusBadge status={assessment.primaryStatus} size="lg" />
            <span className="text-xs text-[#5c5c5c] font-medium">Scope Boundary Assessment</span>
          </div>

          <button
            onClick={onBackToCompare}
            className="text-xs text-[#111111] font-medium hover:underline self-start sm:self-auto"
          >
            Check Another Request →
          </button>
        </div>

        <p className="text-sm text-[#111111] leading-relaxed font-medium">
          {assessment.shortSummary}
        </p>

        {/* Suggested Next Step Callout */}
        <div className="p-4 rounded-[12px] bg-white border border-black/8 flex items-start gap-3 text-xs leading-relaxed">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#111111]">Recommended Next Step: </span>
            <span className="text-[#333333]">{assessment.suggestedNextStep}</span>
          </div>
        </div>
      </div>

      {/* Warnings & Citations Flagged */}
      {assessment.evidenceValidationWarnings.length > 0 && (
        <div className="p-4 rounded-[14px] bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Evidence Verification Alerts</span>
          </div>
          <ul className="space-y-1 text-amber-900">
            {assessment.evidenceValidationWarnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Two Column Section: Identified Changes vs Verified Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Requested Changes Identified */}
        <div className="bg-[#fafbf9] p-6 rounded-[20px] border border-black/8 shadow-sm space-y-3.5">
          <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#111111]" />
            <span>Client Changes Identified</span>
          </h2>

          <ul className="space-y-2 text-xs">
            {assessment.requestedChangesIdentified.map((item, idx) => (
              <li
                key={idx}
                className="p-3 rounded-[10px] bg-white border border-black/8 text-[#333333] leading-relaxed"
              >
                • {item}
              </li>
            ))}
          </ul>

          {assessment.missingOrAmbiguousInfo.length > 0 && (
            <div className="pt-3 border-t border-black/8 space-y-2">
              <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
                <span>Ambiguities to Clarify:</span>
              </p>
              <ul className="text-xs text-[#5c5c5c] space-y-1">
                {assessment.missingOrAmbiguousInfo.map((amb, idx) => (
                  <li key={idx}>• {amb}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Verified Source Evidence */}
        <div className="bg-[#fafbf9] p-6 rounded-[20px] border border-black/8 shadow-sm space-y-3.5">
          <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Verified Agreement Evidence</span>
          </h2>

          {verifiedQuotes.length > 0 ? (
            <div className="space-y-3 text-xs">
              {verifiedQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-[12px] bg-white border border-black/8 space-y-2"
                >
                  <div className="flex items-start gap-2 text-[#111111] italic font-mono text-xs leading-relaxed">
                    <Quote className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <span>"{q.quote}"</span>
                  </div>
                  {q.whyItMatters && (
                    <p className="text-[#5c5c5c] text-[11px] font-sans">
                      <span className="font-semibold text-[#111111]">Why it matters:</span> {q.whyItMatters}
                    </p>
                  )}
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-sans font-medium">
                      <Check className="w-3 h-3" />
                      <span>Verified verbatim in agreement</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5c5c5c] italic p-4 bg-white rounded-[10px] border border-black/8">
              No direct quotation was confirmed in the agreement for this request. Conservative evaluation applied.
            </p>
          )}

          {/* Unverified items list */}
          {unverifiedQuotes.length > 0 && (
            <div className="pt-3 border-t border-black/8 space-y-2">
              <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Unverified Citations Flagged:</span>
              </p>
              {unverifiedQuotes.map((uq) => (
                <div key={uq.id} className="p-2.5 rounded-[8px] bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <p className="italic">"{uq.quote}"</p>
                  <p className="text-[10px] text-amber-700 mt-1">{uq.warning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggested Professional Reply Section */}
      <div className="bg-[#fafbf9] p-6 sm:p-8 rounded-[20px] border border-black/8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#111111] flex items-center gap-2">
              <span>Client Reply Draft</span>
              <span className="text-xs font-normal text-[#5c5c5c]">
                (Professional, non-confrontational, editable)
              </span>
            </h2>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Review and customize before sending. ScopeSentry never sends client messages automatically.
            </p>
          </div>

          <button
            onClick={handleCopyClipboard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#141414] hover:bg-black text-white text-xs font-medium rounded-[9px] shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition duration-150 self-start sm:self-auto"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
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
        <div className="p-4 sm:p-5 rounded-[14px] bg-white border border-black/8 space-y-4 text-xs">
          <p className="font-medium text-[#111111]">
            Optional Freelancer Customizations (included without hallucinated prices or dates):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5c5c5c] mb-1.5 flex items-center gap-1 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Proposed Additional Fee:</span>
              </label>
              <input
                type="text"
                value={proposedFee}
                onChange={(e) => setProposedFee(e.target.value)}
                placeholder="e.g. $450 or $85/hr for 6 hours"
                className="w-full bg-[#fafbf9] border border-black/10 rounded-[8px] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[#5c5c5c] mb-1.5 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Proposed Timeline Adjustment:</span>
              </label>
              <input
                type="text"
                value={proposedTimeline}
                onChange={(e) => setProposedTimeline(e.target.value)}
                placeholder="e.g. 3 additional business days"
                className="w-full bg-[#fafbf9] border border-black/10 rounded-[8px] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5c5c5c] mb-1.5 font-medium">
              Personal Note to Include in Draft:
            </label>
            <input
              type="text"
              value={userCustomNote}
              onChange={(e) => setUserCustomNote(e.target.value)}
              placeholder="e.g. I have time starting Thursday to tackle this."
              className="w-full bg-[#fafbf9] border border-black/10 rounded-[8px] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleUpdateDraft}
              disabled={isUpdatingDraft}
              className="px-3.5 py-1.5 bg-black/5 hover:bg-black/10 text-[#111111] rounded-[7px] text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingDraft ? 'animate-spin' : ''}`} />
              <span>Update Draft with Options</span>
            </button>
          </div>
        </div>

        {/* Editable Message Textarea */}
        <textarea
          rows={9}
          value={editableDraft}
          onChange={(e) => setEditableDraft(e.target.value)}
          className="w-full bg-white border border-black/10 rounded-[12px] p-4 text-xs font-sans text-[#111111] focus:outline-none focus:border-black leading-relaxed"
        />
      </div>
    </div>
  );
};
