import { ProjectAgreement, ScopeAssessment, ExtractedScope } from '@scopesentry/shared';

export type AppView = 'hero' | 'projects' | 'create' | 'review' | 'compare' | 'assessment' | 'settings';

export interface StoredProject extends ProjectAgreement {
  assessments: ScopeAssessment[];
}

export interface PendingAgreementAnalysis {
  projectName: string;
  clientLabel: string;
  originalAgreementText: string;
  notes: string;
  extractedScope: ExtractedScope;
  warnings: string[];
}
