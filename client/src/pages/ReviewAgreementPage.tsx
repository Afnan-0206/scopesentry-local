import React, { useState } from 'react';
import { ExtractedScope, ScopeItem } from '@scopesentry/shared';
import { PendingAgreementAnalysis, StoredProject } from '../types.js';
import { StorageService } from '../services/storage.service.js';
import {
  Check,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowLeft,
  Quote
} from 'lucide-react';

interface Props {
  analysis: PendingAgreementAnalysis;
  isDemoMode: boolean;
  onSaved: (project: StoredProject) => void;
  onBackToEdit: () => void;
}

export const ReviewAgreementPage: React.FC<Props> = ({
  analysis,
  isDemoMode,
  onSaved,
  onBackToEdit,
}) => {
  const [scope, setScope] = useState<ExtractedScope>(analysis.extractedScope);
  const [newDeliverableText, setNewDeliverableText] = useState('');
  const [newExclusionText, setNewExclusionText] = useState('');

  const handleAddDeliverable = () => {
    if (!newDeliverableText.trim()) return;
    const newItem: ScopeItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: newDeliverableText.trim(),
      verbatimQuote: '',
      isVerified: false,
    };
    setScope((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newItem],
    }));
    setNewDeliverableText('');
  };

  const handleRemoveDeliverable = (id: string) => {
    setScope((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((d) => d.id !== id),
    }));
  };

  const handleAddExclusion = () => {
    if (!newExclusionText.trim()) return;
    const newItem: ScopeItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: newExclusionText.trim(),
      verbatimQuote: '',
      isVerified: false,
    };
    setScope((prev) => ({
      ...prev,
      explicitExclusions: [...prev.explicitExclusions, newItem],
    }));
    setNewExclusionText('');
  };

  const handleRemoveExclusion = (id: string) => {
    setScope((prev) => ({
      ...prev,
      explicitExclusions: prev.explicitExclusions.filter((e) => e.id !== id),
    }));
  };

  const handleSaveAndApprove = () => {
    const project: StoredProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectName: analysis.projectName,
      clientLabel: analysis.clientLabel || undefined,
      originalAgreementText: analysis.originalAgreementText,
      notes: analysis.notes || undefined,
      extractedScope: analysis.extractedScope,
      approvedScope: scope,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assessments: [],
    };

    StorageService.saveProject(project, isDemoMode);
    onSaved(project);
  };

  return (
    <div className="max-w-[880px] mx-auto py-6 space-y-6 animate-rise">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="p-1.5 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-[7px] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-[#111111] flex items-center gap-2">
              <span>Review Extracted Scope</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/5 text-[#5c5c5c] font-mono">
                {analysis.projectName}
              </span>
            </h1>
            <p className="text-xs text-[#5c5c5c] mt-0.5">
              Review deliverables and citations before approving. You can edit items or add missing terms.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndApprove}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#141414] hover:bg-black text-white text-xs font-medium rounded-[9px] shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition duration-150 self-start sm:self-auto"
        >
          <Check className="w-4 h-4" />
          <span>Approve & Save Scope</span>
        </button>
      </div>

      {/* Warnings & Citations Summary */}
      {analysis.warnings.length > 0 && (
        <div className="p-4 rounded-[14px] bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <AlertTriangle className="w-4 h-4" />
            <span>Verification Notes</span>
          </div>
          {analysis.warnings.map((w, idx) => (
            <p key={idx} className="text-[#5c5c5c]">• {w}</p>
          ))}
        </div>
      )}

      {/* Section 1: Deliverables */}
      <div className="bg-[#fafbf9] p-6 rounded-[20px] border border-black/8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Agreed Deliverables ({scope.deliverables.length})</span>
          </h2>
          <span className="text-[11px] text-[#5c5c5c]">Core items covered by contract</span>
        </div>

        <div className="space-y-2.5">
          {scope.deliverables.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-[12px] bg-white border border-black/8 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <p className="font-medium text-[#111111]">{item.text}</p>
                {item.verbatimQuote && (
                  <p className="text-[11px] text-[#5c5c5c] italic flex items-center gap-1.5">
                    <Quote className="w-3 h-3 text-[#111111] shrink-0" />
                    <span>"{item.verbatimQuote}"</span>
                    {item.isVerified ? (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-sans font-medium ml-1">
                        Verified verbatim
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-sans font-medium ml-1">
                        Unverified
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveDeliverable(item.id)}
                className="text-[#5c5c5c] hover:text-rose-600 p-1 rounded transition"
                title="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newDeliverableText}
              onChange={(e) => setNewDeliverableText(e.target.value)}
              placeholder="Add another deliverable..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddDeliverable()}
              className="flex-1 bg-white border border-black/10 rounded-[9px] px-3.5 py-2 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-black transition"
            />
            <button
              onClick={handleAddDeliverable}
              className="px-4 py-2 bg-black/5 hover:bg-black/10 text-[#111111] rounded-[9px] text-xs font-medium flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Explicit Exclusions */}
      <div className="bg-[#fafbf9] p-6 rounded-[20px] border border-black/8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#111111] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Explicit Exclusions ({scope.explicitExclusions.length})</span>
          </h2>
          <span className="text-[11px] text-[#5c5c5c]">Items expressly agreed as out of scope</span>
        </div>

        <div className="space-y-2.5">
          {scope.explicitExclusions.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-[12px] bg-white border border-black/8 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <p className="font-medium text-amber-900">{item.text}</p>
                {item.verbatimQuote && (
                  <p className="text-[11px] text-[#5c5c5c] italic flex items-center gap-1.5">
                    <Quote className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>"{item.verbatimQuote}"</span>
                    {item.isVerified && (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-sans font-medium ml-1">
                        Verified verbatim
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveExclusion(item.id)}
                className="text-[#5c5c5c] hover:text-rose-600 p-1 rounded transition"
                title="Remove exclusion"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newExclusionText}
              onChange={(e) => setNewExclusionText(e.target.value)}
              placeholder="Add another explicit exclusion..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddExclusion()}
              className="flex-1 bg-white border border-black/10 rounded-[9px] px-3.5 py-2 text-xs text-[#111111] placeholder-[#888888] focus:outline-none focus:border-black transition"
            />
            <button
              onClick={handleAddExclusion}
              className="px-4 py-2 bg-black/5 hover:bg-black/10 text-[#111111] rounded-[9px] text-xs font-medium flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Revision Policy & Ambiguities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#fafbf9] p-5 rounded-[20px] border border-black/8 shadow-sm space-y-2">
          <h3 className="text-xs font-semibold text-[#111111]">Revision Policy</h3>
          {scope.revisionPolicy ? (
            <div className="p-3 rounded-[10px] bg-white border border-black/8 text-xs space-y-1">
              <p className="font-medium text-[#111111]">{scope.revisionPolicy.text}</p>
              {scope.revisionPolicy.verbatimQuote && (
                <p className="text-[11px] text-[#5c5c5c] italic">
                  "{scope.revisionPolicy.verbatimQuote}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#5c5c5c] italic">No revision policy specified in the agreement.</p>
          )}
        </div>

        <div className="bg-[#fafbf9] p-5 rounded-[20px] border border-black/8 shadow-sm space-y-2">
          <h3 className="text-xs font-semibold text-[#111111]">
            Ambiguities or Conflicting Clauses ({scope.ambiguousOrConflictingClauses.length})
          </h3>
          {scope.ambiguousOrConflictingClauses.length > 0 ? (
            <ul className="text-xs text-[#5c5c5c] space-y-1.5">
              {scope.ambiguousOrConflictingClauses.map((clause, idx) => (
                <li key={idx} className="p-2 rounded-[8px] bg-white border border-black/8">
                  • {clause}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#5c5c5c] italic">No conflicting clauses detected.</p>
          )}
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="pt-6 border-t border-black/8 flex items-center justify-between">
        <button
          onClick={onBackToEdit}
          className="text-xs text-[#5c5c5c] hover:text-[#111111] transition"
        >
          ← Back to Edit Agreement
        </button>

        <button
          onClick={handleSaveAndApprove}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#141414] hover:bg-black text-white text-xs font-medium rounded-[9px] shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition duration-150"
        >
          <Check className="w-4 h-4" />
          <span>Approve & Save Scope</span>
        </button>
      </div>
    </div>
  );
};
