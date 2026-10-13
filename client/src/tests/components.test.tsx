import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/StatusBadge.js';
import { StorageService } from '../services/storage.service.js';
import { StoredProject } from '../types.js';

describe('Frontend UI Components and Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('StatusBadge correctly renders INCLUDED status', () => {
    render(<StatusBadge status="INCLUDED" />);
    expect(screen.getByText('INCLUDED')).toBeInTheDocument();
  });

  it('StatusBadge correctly renders POTENTIAL SCOPE CHANGE status', () => {
    render(<StatusBadge status="POTENTIAL SCOPE CHANGE" />);
    expect(screen.getByText('POTENTIAL SCOPE CHANGE')).toBeInTheDocument();
  });

  it('StatusBadge correctly renders NEEDS CLARIFICATION status', () => {
    render(<StatusBadge status="NEEDS CLARIFICATION" />);
    expect(screen.getByText('NEEDS CLARIFICATION')).toBeInTheDocument();
  });

  it('StorageService correctly stores, retrieves, and deletes projects', () => {
    const mockProject: StoredProject = {
      id: 'test_p1',
      projectName: 'Test Web App',
      originalAgreementText: 'Deliverables: 3 web pages.',
      extractedScope: {
        deliverables: [{ id: '1', text: '3 web pages', verbatimQuote: '3 web pages', isVerified: true }],
        explicitInclusions: [],
        explicitExclusions: [],
        constraints: [],
        revisionPolicy: null,
        milestonesAndDeadlines: [],
        assumptions: [],
        ambiguousOrConflictingClauses: [],
        evidenceExcerpts: [],
      },
      approvedScope: {
        deliverables: [{ id: '1', text: '3 web pages', verbatimQuote: '3 web pages', isVerified: true }],
        explicitInclusions: [],
        explicitExclusions: [],
        constraints: [],
        revisionPolicy: null,
        milestonesAndDeadlines: [],
        assumptions: [],
        ambiguousOrConflictingClauses: [],
        evidenceExcerpts: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assessments: [],
    };

    StorageService.saveProject(mockProject, false);
    const retrieved = StorageService.getProjects(false);
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].projectName).toBe('Test Web App');

    StorageService.deleteProject('test_p1', false);
    const afterDelete = StorageService.getProjects(false);
    expect(afterDelete).toHaveLength(0);
  });

  it('StorageService exports assessment as clean Markdown report', () => {
    const mockProject: StoredProject = {
      id: 'test_p2',
      projectName: 'Client Redesign',
      clientLabel: 'Acme',
      originalAgreementText: 'Deliverables: Home and About pages.',
      extractedScope: {
        deliverables: [],
        explicitInclusions: [],
        explicitExclusions: [],
        constraints: [],
        revisionPolicy: null,
        milestonesAndDeadlines: [],
        assumptions: [],
        ambiguousOrConflictingClauses: [],
        evidenceExcerpts: [],
      },
      approvedScope: {
        deliverables: [],
        explicitInclusions: [],
        explicitExclusions: [],
        constraints: [],
        revisionPolicy: null,
        milestonesAndDeadlines: [],
        assumptions: [],
        ambiguousOrConflictingClauses: [],
        evidenceExcerpts: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assessments: [],
    };

    const assessment = {
      id: 'assess_test',
      projectId: 'test_p2',
      primaryStatus: 'POTENTIAL SCOPE CHANGE' as const,
      shortSummary: 'Authentication dashboard exceeds agreed deliverables.',
      requestedChangesIdentified: ['User authentication'],
      relevantOriginalScopeItems: ['Home and About pages'],
      supportingQuotations: [
        {
          id: 'q1',
          quote: 'Deliverables: Home and About pages.',
          whyItMatters: 'Demonstrates deliverables limitation.',
          isVerified: true,
        },
      ],
      missingOrAmbiguousInfo: [],
      suggestedNextStep: 'Offer change order.',
      draftReply: 'Hi, auth is an additional feature.',
      evidenceValidationWarnings: [],
      evaluatedAt: new Date().toISOString(),
    };

    const markdown = StorageService.exportAssessmentMarkdown(mockProject, assessment);
    expect(markdown).toContain('# ScopeSentry Assessment Report');
    expect(markdown).toContain('**Project:** Client Redesign');
    expect(markdown).toContain('POTENTIAL SCOPE CHANGE');
    expect(markdown).toContain('Deliverables: Home and About pages.');
    expect(markdown).toContain('## Verified Evidence from Original Agreement');
  });
});
