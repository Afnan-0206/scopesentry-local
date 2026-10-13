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
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Review Extracted Scope</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {analysis.projectName}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Review and correct the extracted deliverables before saving. You can edit items or add missing terms.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndApprove}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Check className="w-4 h-4" />
          <span>Approve & Save Scope</span>
        </button>
      </div>

      {/* Warnings & Citations Count */}
      {analysis.warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-amber-300">
            <AlertTriangle className="w-4 h-4" />
            <span>Verification Notes</span>
          </div>
          {analysis.warnings.map((w, idx) => (
            <p key={idx}>• {w}</p>
          ))}
        </div>
      )}

      {/* Section 1: Deliverables */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Agreed Deliverables ({scope.deliverables.length})</span>
          </h2>
          <span className="text-[11px] text-slate-500">Core deliverables included in project</span>
        </div>

        <div className="space-y-2">
          {scope.deliverables.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <p className="font-medium text-slate-100">{item.text}</p>
                {item.verbatimQuote && (
                  <p className="text-[11px] text-slate-400 italic flex items-center gap-1">
                    <Quote className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>"{item.verbatimQuote}"</span>
                    {item.isVerified ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-900/60 ml-1">
                        Verified verbatim
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-900/60 ml-1">
                        Unverified
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveDeliverable(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1 transition"
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
              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddDeliverable}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Explicit Exclusions */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Explicit Exclusions ({scope.explicitExclusions.length})</span>
          </h2>
          <span className="text-[11px] text-slate-500">Items expressly agreed as out of scope</span>
        </div>

        <div className="space-y-2">
          {scope.explicitExclusions.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <p className="font-medium text-amber-200">{item.text}</p>
                {item.verbatimQuote && (
                  <p className="text-[11px] text-slate-400 italic flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>"{item.verbatimQuote}"</span>
                    {item.isVerified && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-900/60 ml-1">
                        Verified verbatim
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveExclusion(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1 transition"
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
              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleAddExclusion}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Revision Policy & Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <h3 className="text-xs font-semibold text-slate-300">Revision Policy</h3>
          {scope.revisionPolicy ? (
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs">
              <p className="font-medium text-slate-200">{scope.revisionPolicy.text}</p>
              {scope.revisionPolicy.verbatimQuote && (
                <p className="text-[11px] text-slate-400 mt-1 italic">
                  "{scope.revisionPolicy.verbatimQuote}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No revision policy specified in the agreement.</p>
          )}
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <h3 className="text-xs font-semibold text-slate-300">
            Ambiguities or Conflicting Clauses ({scope.ambiguousOrConflictingClauses.length})
          </h3>
          {scope.ambiguousOrConflictingClauses.length > 0 ? (
            <ul className="text-xs text-sky-300/90 space-y-1">
              {scope.ambiguousOrConflictingClauses.map((clause, idx) => (
                <li key={idx} className="p-1.5 rounded bg-sky-950/30 border border-sky-900/40">
                  • {clause}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No conflicting clauses detected.</p>
          )}
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={onBackToEdit}
          className="text-xs text-slate-400 hover:text-slate-200 transition"
        >
          ← Back to Edit Agreement
        </button>

        <button
          onClick={handleSaveAndApprove}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Check className="w-4 h-4" />
          <span>Approve & Save Scope</span>
        </button>
      </div>
    </div>
  );
};
