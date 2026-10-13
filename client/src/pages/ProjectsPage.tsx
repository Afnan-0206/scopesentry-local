import React from 'react';
import { StoredProject } from '../types.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { StorageService } from '../services/storage.service.js';
import {
  Plus,
  ArrowRight,
  Trash2,
  Download,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';

interface Props {
  projects: StoredProject[];
  isDemoMode: boolean;
  onSelectProject: (project: StoredProject) => void;
  onCreateNew: () => void;
  onDeleteProject: (id: string) => void;
  onRefreshProjects: () => void;
}

export const ProjectsPage: React.FC<Props> = ({
  projects,
  isDemoMode,
  onSelectProject,
  onCreateNew,
  onDeleteProject,
}) => {
  const handleExportJson = (e: React.MouseEvent, project: StoredProject) => {
    e.stopPropagation();
    const jsonStr = StorageService.exportProjectJson(project);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.projectName.toLowerCase().replace(/\s+/g, '_')}_scope.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"? This removes locally stored history for this project.`)) {
      onDeleteProject(id);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Project Agreements</span>
            {isDemoMode && (
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                Demo Fixture Library
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Locally saved freelance scopes. Compare client messages against verified agreement boundaries.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Agreement</span>
        </button>
      </div>

      {/* Projects List or Empty State */}
      {projects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-xl border border-slate-800/80">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-4">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-slate-200">No project agreements saved yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Paste your client contract, proposal, or statement of work. ScopeSentry will extract structured deliverables and verify quotations locally.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const latestAssessment = project.assessments && project.assessments[0];
            const deliverablesCount = project.approvedScope?.deliverables?.length || 0;
            const exclusionsCount = project.approvedScope?.explicitExclusions?.length || 0;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-slate-100 group-hover:text-emerald-400 transition truncate">
                      {project.projectName}
                    </h3>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleExportJson(e, project)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                        title="Export project data as JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, project.id, project.projectName)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {project.clientLabel && (
                    <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                      <span className="font-medium text-slate-300">Client:</span> {project.clientLabel}
                    </p>
                  )}

                  {/* Badges for deliverables & exclusions */}
                  <div className="flex flex-wrap gap-2 text-xs mb-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                      {deliverablesCount} Deliverables
                    </span>
                    {exclusionsCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-amber-300/90 border border-amber-900/30">
                        {exclusionsCount} Exclusions
                      </span>
                    )}
                    {project.approvedScope?.revisionPolicy && (
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-sky-300/90 border border-sky-900/30">
                        Revision Policy Defined
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Recent Assessment & CTA */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between mt-auto text-xs">
                  {latestAssessment ? (
                    <div className="flex items-center gap-2">
                      <StatusBadge status={latestAssessment.primaryStatus} size="sm" />
                      <span className="text-slate-500">
                        {new Date(latestAssessment.evaluatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Ready to check requests</span>
                    </span>
                  )}

                  <span className="text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 font-medium transition">
                    <span>Open Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
