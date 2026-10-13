import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Express REST API Endpoints', () => {
  it('GET /api/health should return 200 with service information and loopback binding', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('ScopeSentry Local Backend');
    expect(res.body.privacy.isLoopback).toBe(true);
    expect(res.body.privacy.externalThirdPartyAiApis).toBe(false);
    expect(res.body.ollama).toBeDefined();
  });

  it('GET /api/models should return available models list and configured model', async () => {
    const res = await request(app).get('/api/models');
    expect(res.status).toBe(200);
    expect(res.body.configured).toBeDefined();
    expect(Array.isArray(res.body.models)).toBe(true);
  });

  it('POST /api/agreements/analyze should reject empty agreement text with 400', async () => {
    const res = await request(app)
      .post('/api/agreements/analyze')
      .send({
        projectName: 'Test Project',
        originalAgreementText: '   ',
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
  });

  it('POST /api/agreements/analyze should reject oversized agreement text (>20000 chars)', async () => {
    const hugeText = 'A'.repeat(20005);
    const res = await request(app)
      .post('/api/agreements/analyze')
      .send({
        projectName: 'Huge Project',
        originalAgreementText: hugeText,
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
  });

  it('POST /api/compare should reject client request below minimum length', async () => {
    const res = await request(app)
      .post('/api/compare')
      .send({
        projectId: 'p1',
        originalAgreementText: 'Valid agreement text of sufficient length.',
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
        newClientRequest: 'hi', // too short (< 5 chars)
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
  });

  it('POST /api/replies/draft should not invent fees or deadlines when user leaves them empty', async () => {
    const assessment = {
      id: 'assess_test',
      projectId: 'proj_test',
      primaryStatus: 'POTENTIAL SCOPE CHANGE' as const,
      shortSummary: 'Authentication dashboard is not in deliverables.',
      requestedChangesIdentified: ['User authentication', 'Customer dashboard'],
      relevantOriginalScopeItems: ['5 static pages'],
      supportingQuotations: [],
      missingOrAmbiguousInfo: [],
      suggestedNextStep: 'Offer a scope adjustment proposal.',
      draftReply: '',
      evidenceValidationWarnings: [],
      evaluatedAt: new Date().toISOString(),
    };

    const res = await request(app)
      .post('/api/replies/draft')
      .send({
        assessment,
        proposedFee: '',
        proposedTimeline: '',
        userCustomNote: '',
      });

    expect(res.status).toBe(200);
    expect(res.body.includesUserFee).toBe(false);
    expect(res.body.includesUserTimeline).toBe(false);
    // Ensure draft does not contain fabricated dollar amount or arbitrary hours
    expect(res.body.draftReply).not.toMatch(/\$\d+/);
    expect(res.body.draftReply).not.toMatch(/\d+\s*(hours|days|weeks)/i);
    expect(res.body.draftReply).toContain('User authentication');
  });

  it('POST /api/replies/draft should include user proposed fee and timeline when explicitly provided', async () => {
    const assessment = {
      id: 'assess_test',
      projectId: 'proj_test',
      primaryStatus: 'POTENTIAL SCOPE CHANGE' as const,
      shortSummary: 'Payment gateway requested.',
      requestedChangesIdentified: ['Stripe payment checkout'],
      relevantOriginalScopeItems: ['Payment gateway excluded'],
      supportingQuotations: [],
      missingOrAmbiguousInfo: [],
      suggestedNextStep: 'Send estimate for payment gateway.',
      draftReply: '',
      evidenceValidationWarnings: [],
      evaluatedAt: new Date().toISOString(),
    };

    const res = await request(app)
      .post('/api/replies/draft')
      .send({
        assessment,
        proposedFee: '$650 fixed fee',
        proposedTimeline: '3 additional business days',
        userCustomNote: 'Client must provide Stripe API keys.',
      });

    expect(res.status).toBe(200);
    expect(res.body.includesUserFee).toBe(true);
    expect(res.body.includesUserTimeline).toBe(true);
    expect(res.body.draftReply).toContain('$650 fixed fee');
    expect(res.body.draftReply).toContain('3 additional business days');
    expect(res.body.draftReply).toContain('Client must provide Stripe API keys.');
  });
});
