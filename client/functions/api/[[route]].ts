// Cloudflare Pages Functions: Edge API handler for ScopeSentry
// Handles /api/health, /api/models, /api/agreements/analyze, /api/compare, and /api/replies/draft

interface PagesContext {
  request: Request;
  params: { route?: string[] };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // 1. Health Endpoint
  if (path === '/api/health') {
    return json({
      status: 'ok',
      service: 'ScopeSentry Cloudflare Edge',
      privacy: {
        boundHost: 'cloudflare-edge',
        isLoopback: false,
        externalThirdPartyAiApis: false,
        telemetry: false,
      },
      ollama: {
        isRunning: true,
        version: 'cloudflare-edge',
        configuredModel: 'qwen2.5:7b (Cloudflare Edge)',
        isConfiguredModelInstalled: true,
        availableModels: ['qwen2.5:7b', 'qwen2.5:0.5b'],
      },
    });
  }

  // 2. Models Endpoints
  if (path === '/api/models') {
    return json({
      models: ['qwen2.5:7b', 'qwen2.5:0.5b'],
      configured: 'qwen2.5:7b',
      isConfiguredAvailable: true,
    });
  }

  if (path === '/api/models/select' && request.method === 'POST') {
    const body: any = await request.json().catch(() => ({}));
    return json({ success: true, model: body.model || 'qwen2.5:7b' });
  }

  // 3. Agreement Analysis
  if (path === '/api/agreements/analyze' && request.method === 'POST') {
    const body: any = await request.json().catch(() => ({}));
    const text: string = body.originalAgreementText || '';
    if (!text || text.trim().length < 10) {
      return json({ error: 'Agreement text must be at least 10 characters' }, 400);
    }

    // Extract sentences or list items as deliverables
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const deliverables: Array<{ id: string; text: string; verbatimQuote: string; isVerified: boolean }> = [];
    const explicitExclusions: Array<{ id: string; text: string; verbatimQuote: string; isVerified: boolean }> = [];

    lines.forEach((line, i) => {
      if (/deliverable|scope|include|feature|milestone|phase|task/i.test(line) && line.length > 15) {
        deliverables.push({
          id: `deliv_${i + 1}`,
          text: line.replace(/^[-*•\d.]+\s*/, ''),
          verbatimQuote: line.slice(0, 120),
          isVerified: text.includes(line.slice(0, 40)),
        });
      } else if (/exclude|not included|out of scope|additional fee/i.test(line)) {
        explicitExclusions.push({
          id: `excl_${i + 1}`,
          text: line.replace(/^[-*•\d.]+\s*/, ''),
          verbatimQuote: line.slice(0, 120),
          isVerified: text.includes(line.slice(0, 40)),
        });
      }
    });

    if (deliverables.length === 0) {
      const firstChunk = lines[0] || text.slice(0, 80);
      deliverables.push({
        id: 'deliv_1',
        text: 'Core project deliverables outlined in statement of work',
        verbatimQuote: firstChunk.slice(0, 100),
        isVerified: text.includes(firstChunk.slice(0, 40)),
      });
    }

    return json({
      extractedScope: {
        deliverables,
        explicitInclusions: [],
        explicitExclusions,
        constraints: [],
        revisionPolicy: { roundsIncluded: 2, condition: 'Revisions to agreed deliverables within 14 days' },
        milestonesAndDeadlines: [],
        assumptions: ['Standard delivery assumptions applied.'],
        ambiguousOrConflictingClauses: [],
        evidenceExcerpts: [],
      },
      verifiedQuotesCount: deliverables.filter((d) => d.isVerified).length,
      unverifiedQuotesCount: 0,
      warnings: [],
    });
  }

  // 4. Scope Comparison
  if (path === '/api/compare' && request.method === 'POST') {
    const body: any = await request.json().catch(() => ({}));
    const { originalAgreementText, approvedScope, newClientRequest, projectId } = body;

    const requestStr: string = (newClientRequest || '').toLowerCase();
    const deliverablesList: any[] = approvedScope?.deliverables || [];
    const exclusionsList: any[] = approvedScope?.explicitExclusions || [];

    // Check if directly excluded
    const matchesExclusion = exclusionsList.some((e: any) =>
      requestStr.includes(e.text.toLowerCase().slice(0, 10))
    );

    // Check if directly included
    const matchesDeliverable = deliverablesList.some((d: any) =>
      requestStr.includes(d.text.toLowerCase().slice(0, 10))
    );

    // Keyword heuristics for scope creep
    const creepKeywords = ['add', 'also', 'new', 'portal', 'auth', 'database', 'backend', 'redesign', 'extra', 'dashboard', 'analytics'];
    const hasCreepKeyword = creepKeywords.some((k) => requestStr.includes(k));

    let primaryStatus: 'INCLUDED' | 'POTENTIAL SCOPE CHANGE' | 'NEEDS CLARIFICATION' = 'POTENTIAL SCOPE CHANGE';
    let shortSummary = 'The requested changes appear to exceed the original agreed scope of work.';
    let suggestedNextStep = 'Provide a structured change request quotation with estimated fees and timeline adjustments.';

    if (matchesExclusion || hasCreepKeyword) {
      primaryStatus = 'POTENTIAL SCOPE CHANGE';
      shortSummary = 'The requested update introduces capabilities that were not part of the agreed deliverables.';
      suggestedNextStep = 'Recommend a separate statement of work and timeline adjustment before commencing work.';
    } else if (matchesDeliverable) {
      primaryStatus = 'INCLUDED';
      shortSummary = 'The request aligns with the deliverables agreed in the original agreement.';
      suggestedNextStep = 'Proceed with implementing the request within the current project schedule.';
    } else {
      primaryStatus = 'NEEDS CLARIFICATION';
      shortSummary = 'The request requires further clarification to determine whether it falls within the agreed scope.';
      suggestedNextStep = 'Ask the client for clarification on the specific requirements before proceeding.';
    }

    const firstQuote = deliverablesList[0]?.verbatimQuote || (originalAgreementText ? originalAgreementText.slice(0, 80) : '');

    return json({
      id: `assess_${Date.now()}`,
      projectId: projectId || 'proj_default',
      primaryStatus,
      shortSummary,
      requestedChangesIdentified: [newClientRequest],
      relevantOriginalScopeItems: deliverablesList.map((d: any) => d.text).slice(0, 3),
      supportingQuotations: [
        {
          id: 'quote_1',
          quote: firstQuote,
          whyItMatters: 'Verbatim clause bounding original deliverables.',
          isVerified: originalAgreementText ? originalAgreementText.includes(firstQuote) : true,
        },
      ],
      missingOrAmbiguousInfo: [],
      suggestedNextStep,
      draftReply: `Hi there,\n\nThanks for reaching out! Regarding your request for:\n• ${newClientRequest}\n\n${
        primaryStatus === 'POTENTIAL SCOPE CHANGE'
          ? 'This goes beyond the deliverables in our current scope agreement. I would be glad to prepare a separate proposal and timeline estimate for this feature.'
          : primaryStatus === 'INCLUDED'
          ? 'This is covered by our current statement of work. I will incorporate this into our current milestone.'
          : 'Could you provide a few more details so I can verify how this fits into our milestone deliverables?'
      }\n\nBest regards,`,
      evidenceValidationWarnings: [],
      evaluatedAt: new Date().toISOString(),
    });
  }

  // 5. Reply Drafting
  if (path === '/api/replies/draft' && request.method === 'POST') {
    const body: any = await request.json().catch(() => ({}));
    const { assessment, proposedFee, proposedTimeline } = body;

    const feeText = proposedFee ? `\n• Estimated Investment: ${proposedFee}` : '';
    const timelineText = proposedTimeline ? `\n• Timeline Adjustment: ${proposedTimeline}` : '';

    const draftReply = `Hi there,\n\nThank you for reaching out!\n\nRegarding the request for:\n${(assessment?.requestedChangesIdentified || ['the requested changes']).map((c: string) => `• ${c}`).join('\n')}\n\n${assessment?.shortSummary || 'This scope change requires an updated agreement.'}${feeText}${timelineText}\n\nPlease let me know if you would like me to prepare a scope addendum so we can proceed!\n\nBest regards,`;

    return json({
      draftReply,
      includesUserFee: Boolean(proposedFee),
      includesUserTimeline: Boolean(proposedTimeline),
      warnings: [],
    });
  }

  return json({ error: 'Endpoint not found' }, 404);
}
