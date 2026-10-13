import { ScopeAssessment } from '@scopesentry/shared';

export function buildReplyDraftPrompt(
  assessment: ScopeAssessment,
  proposedFee?: string,
  proposedTimeline?: string,
  userCustomNote?: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are ScopeSentry's professional communications specialist.
Your goal is to draft an editable, polite, client-facing email or message for a freelancer.

CRITICAL SAFETY & PRICING RULES:
1. NEVER fabricate, estimate, or invent any price, hourly rate, dollar amount, or fee unless explicitly provided by the user in the prompt.
2. NEVER fabricate, promise, or invent any deadline, turnaround time, or delivery date unless explicitly provided by the user.
3. If no fee is provided, refer to scope adjustments generally (e.g. "I would be glad to provide a separate estimate for this additional feature").
4. If the user provided a fee or timeline, state it clearly as an estimate or proposal.
5. Tone must be professional, warm, non-accusatory, and collaborative.
6. The output must be JSON only: { "draftReply": "..." }`;

  const userPrompt = `Draft a client message based on this assessment:

Status: ${assessment.primaryStatus}
Summary: ${assessment.shortSummary}
Requested Changes: ${assessment.requestedChangesIdentified.join(', ')}
Original Scope Reference: ${assessment.relevantOriginalScopeItems.join(', ')}
Next Step Suggested: ${assessment.suggestedNextStep}

${proposedFee ? `User's Proposed Fee/Rate: ${proposedFee}` : 'User Fee: [NONE PROVIDED - DO NOT INVENT A PRICE]'}
${proposedTimeline ? `User's Proposed Timeline: ${proposedTimeline}` : 'User Timeline: [NONE PROVIDED - DO NOT INVENT A TIMELINE]'}
${userCustomNote ? `Freelancer's Custom Note to Include: ${userCustomNote}` : ''}

Generate JSON only: { "draftReply": "..." }`;

  return { systemPrompt, userPrompt };
}
