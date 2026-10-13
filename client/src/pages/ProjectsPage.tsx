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
    <div className="space-y-8 max-w-[1120px] mx-auto py-6 animate-rise">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/8">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#111111]">
              Project Workspace
            </h1>
            {isDemoMode && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Demo Library
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#5c5c5c]">
            Locally saved freelance scopes. Review agreements, check client requests, and protect deliverables.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141414] hover:bg-black text-white font-medium text-xs rounded-[9px] shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition duration-150 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Scope Agreement</span>
        </button>
      </div>

      {/* Projects List or Empty State */}
      {projects.length === 0 ? (
        <div className="text-center py-20 px-6 bg-[#fafbf9] rounded-[20px] border border-black/8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-black/4 flex items-center justify-center mx-auto text-[#111111] mb-4">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-[#111111]">No project agreements saved yet</h3>
          <p className="text-xs text-[#5c5c5c] max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
            Paste your client contract, proposal, or statement of work. ScopeSentry will extract structured deliverables and verify citations locally.
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#141414] hover:bg-black text-white text-xs font-medium rounded-[9px] shadow-sm hover:-translate-y-0.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project) => {
            const latestAssessment = project.assessments && project.assessments[0];
            const deliverablesCount = project.approvedScope?.deliverables?.length || 0;
            const exclusionsCount = project.approvedScope?.explicitExclusions?.length || 0;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group relative bg-[#fafbf9] hover:bg-white border border-black/8 hover:border-black/20 rounded-[20px] p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-[#111111] group-hover:text-black transition truncate">
                      {project.projectName}
                    </h3>
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleExportJson(e, project)}
                        className="p-1.5 text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 rounded-[7px] transition"
                        title="Export project data as JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, project.id, project.projectName)}
                        className="p-1.5 text-[#5c5c5c] hover:text-rose-600 hover:bg-rose-50 rounded-[7px] transition"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {project.clientLabel && (
                    <p className="text-xs text-[#5c5c5c] mb-4">
                      <span className="font-medium text-[#111111]">Client:</span> {project.clientLabel}
                    </p>
                  )}

                  {/* Badges for deliverables & exclusions */}
                  <div className="flex flex-wrap gap-2 text-[11px] mb-5">
                    <span className="px-2.5 py-1 rounded-full bg-black/4 text-[#333333] border border-black/6">
                      {deliverablesCount} Deliverables
                    </span>
                    {exclusionsCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        {exclusionsCount} Exclusions
                      </span>
                    )}
                    {project.approvedScope?.revisionPolicy && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#333333] border border-slate-200">
                        Revision Policy
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Recent Assessment & CTA */}
                <div className="pt-4 border-t border-black/6 flex items-center justify-between mt-auto text-xs">
                  {latestAssessment ? (
                    <div className="flex items-center gap-2">
                      <StatusBadge status={latestAssessment.primaryStatus} size="sm" />
                      <span className="text-[#5c5c5c] text-[11px]">
                        {new Date(latestAssessment.evaluatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#5c5c5c] flex items-center gap-1.5 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready for requests</span>
                    </span>
                  )}

                  <span className="text-[#111111] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition duration-150">
                    <span>Open</span>
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
