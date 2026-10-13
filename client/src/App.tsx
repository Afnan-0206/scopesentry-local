import React, { useState, useEffect } from 'react';
import { AppView, StoredProject, PendingAgreementAnalysis } from './types.js';
import { StorageService } from './services/storage.service.js';
import { ApiService, BackendHealth } from './services/api.service.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { CreateProjectPage } from './pages/CreateProjectPage.js';
import { ReviewAgreementPage } from './pages/ReviewAgreementPage.js';
import { CompareRequestPage } from './pages/CompareRequestPage.js';
import { AssessmentResultsPage } from './pages/AssessmentResultsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('projects');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('scopesentry_demo_mode') === 'true';
  });

  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [activeProject, setActiveProject] = useState<StoredProject | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<PendingAgreementAnalysis | null>(null);
  const [activeAssessmentIndex, setActiveAssessmentIndex] = useState<number>(0);
  const [health, setHealth] = useState<BackendHealth | null>(null);

  // Load health and check local Ollama availability
  const checkHealth = async () => {
    try {
      const data = await ApiService.getHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: 'unreachable',
        service: 'ScopeSentry Local Backend',
        privacy: {
          boundHost: '127.0.0.1',
          isLoopback: true,
          externalThirdPartyAiApis: false,
          telemetry: false,
        },
        ollama: {
          isRunning: false,
          configuredModel: 'qwen2.5:7b',
          isConfiguredModelInstalled: false,
          availableModels: [],
          error: 'Local backend unreachable.',
        },
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load projects from storage
  const loadProjects = () => {
    const list = StorageService.getProjects(isDemoMode);
    setProjects(list);
    if (activeProject) {
      const found = list.find((p) => p.id === activeProject.id);
      setActiveProject(found || null);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [isDemoMode]);

  const handleToggleDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    localStorage.setItem('scopesentry_demo_mode', String(val));
  };

  const handleSelectProject = (project: StoredProject) => {
    setActiveProject(project);
    setCurrentView('compare');
  };

  const handleAnalysisSuccess = (analysis: PendingAgreementAnalysis) => {
    setPendingAnalysis(analysis);
    setCurrentView('review');
  };

  const handleProjectSaved = (project: StoredProject) => {
    loadProjects();
    setActiveProject(project);
    setPendingAnalysis(null);
    setCurrentView('compare');
  };

  const handleDeleteProject = (id: string) => {
    StorageService.deleteProject(id, isDemoMode);
    loadProjects();
    if (activeProject?.id === id) {
      setActiveProject(null);
      setCurrentView('projects');
    }
  };

  const handleAssessmentCompleted = (project: StoredProject, index: number) => {
    loadProjects();
    setActiveProject(project);
    setActiveAssessmentIndex(index);
    setCurrentView('assessment');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        health={health}
        isDemoMode={isDemoMode}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentView === 'projects' && (
          <ProjectsPage
            projects={projects}
            isDemoMode={isDemoMode}
            onSelectProject={handleSelectProject}
            onCreateNew={() => setCurrentView('create')}
            onDeleteProject={handleDeleteProject}
            onRefreshProjects={loadProjects}
          />
        )}

        {currentView === 'create' && (
          <CreateProjectPage
            isDemoMode={isDemoMode}
            health={health}
            onAnalysisSuccess={handleAnalysisSuccess}
            onCancel={() => setCurrentView('projects')}
            onOpenSettings={() => setCurrentView('settings')}
          />
        )}

        {currentView === 'review' && pendingAnalysis && (
          <ReviewAgreementPage
            analysis={pendingAnalysis}
            isDemoMode={isDemoMode}
            onSaved={handleProjectSaved}
            onBackToEdit={() => setCurrentView('create')}
          />
        )}

        {currentView === 'compare' && activeProject && (
          <CompareRequestPage
            project={activeProject}
            isDemoMode={isDemoMode}
            health={health}
            onAssessmentCompleted={handleAssessmentCompleted}
            onBack={() => setCurrentView('projects')}
          />
        )}

        {currentView === 'assessment' && activeProject && (
          <AssessmentResultsPage
            project={activeProject}
            assessment={
              activeProject.assessments && activeProject.assessments[activeAssessmentIndex]
                ? activeProject.assessments[activeAssessmentIndex]
                : {
                    id: 'temp',
                    projectId: activeProject.id,
                    primaryStatus: 'NEEDS CLARIFICATION',
                    shortSummary: 'No assessment selected.',
                    requestedChangesIdentified: [],
                    relevantOriginalScopeItems: [],
                    supportingQuotations: [],
                    missingOrAmbiguousInfo: [],
                    suggestedNextStep: 'Check a new request.',
                    draftReply: '',
                    evidenceValidationWarnings: [],
                    evaluatedAt: new Date().toISOString(),
                  }
            }
            isDemoMode={isDemoMode}
            onBackToCompare={() => setCurrentView('compare')}
          />
        )}

        {currentView === 'settings' && (
          <SettingsPage
            health={health}
            isDemoMode={isDemoMode}
            onToggleDemoMode={handleToggleDemoMode}
            onRefreshHealth={checkHealth}
            onDataCleared={() => {
              loadProjects();
              setActiveProject(null);
              setCurrentView('projects');
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};
