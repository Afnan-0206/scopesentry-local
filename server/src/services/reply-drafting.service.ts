import { DraftReplyInput, DraftReplyResponse } from '@scopesentry/shared';
import { OllamaService, defaultOllamaService } from './ollama.service.js';
import { buildReplyDraftPrompt } from '../prompts/reply-draft.prompt.js';

export class ReplyDraftingService {
  constructor(private ollamaService: OllamaService = defaultOllamaService) {}

  /**
   * Deterministic template generator guaranteed to never invent prices or deadlines.
   */
  public generateDeterministicReply(input: DraftReplyInput): DraftReplyResponse {
    const { assessment, proposedFee, proposedTimeline, userCustomNote } = input;
    const { primaryStatus, requestedChangesIdentified, relevantOriginalScopeItems } = assessment;

    let body = '';
    const warnings: string[] = [];

    const changesText = requestedChangesIdentified.length > 0
      ? requestedChangesIdentified.map(c => `• ${c}`).join('\n')
      : '• The additional requested functionality';

    const scopeRefText = relevantOriginalScopeItems.length > 0
      ? `Based on our agreed project scope (${relevantOriginalScopeItems.join(', ')}), `
      : 'Based on our original project scope, ';

    if (primaryStatus === 'INCLUDED') {
      body = `Hi there,\n\nThanks for sending over this update!\n\n${scopeRefText}these items are already covered within our agreed deliverables:\n${changesText}\n\nI will proceed with incorporating these as part of our current milestone.\n\nPlease let me know if you have any questions!`;
    } else if (primaryStatus === 'POTENTIAL SCOPE CHANGE') {
      let feeClause = '';
      if (proposedFee && proposedFee.trim().length > 0) {
        feeClause += `\nEstimated investment: ${proposedFee.trim()}`;
      } else {
        feeClause += `\nI would be happy to put together a separate estimate for this additional scope.`;
      }

      let timelineClause = '';
      if (proposedTimeline && proposedTimeline.trim().length > 0) {
        timelineClause += `\nEstimated timeline adjustment: ${proposedTimeline.trim()}`;
      } else {
        timelineClause += `\nWe can also discuss any timeline adjustments needed before we begin.`;
      }

      body = `Hi there,\n\nThank you for reaching out with these new details!\n\n${scopeRefText}the following request appears to go beyond our originally agreed deliverables:\n${changesText}\n\nTo ensure we keep the current project on track, I would love to treat this as an addition to our scope.${feeClause}${timelineClause}\n\nPlease let me know how you'd like to proceed!`;
    } else {
      // NEEDS CLARIFICATION
      body = `Hi there,\n\nThank you for sharing this request!\n\n${scopeRefText}a few details around this request are ambiguous or need clarification:\n${changesText}\n\nBefore proceeding, could you clarify your exact requirements so I can confirm whether this is covered or if it requires a revised timeline?\n\nLooking forward to your thoughts!`;
    }

    if (userCustomNote && userCustomNote.trim().length > 0) {
      body += `\n\nNote: ${userCustomNote.trim()}`;
    }

    body += `\n\nBest regards,`;

    return {
      draftReply: body,
      includesUserFee: Boolean(proposedFee && proposedFee.trim().length > 0),
      includesUserTimeline: Boolean(proposedTimeline && proposedTimeline.trim().length > 0),
      warnings,
    };
  }

  /**
   * Drafts an editable reply using the local LLM if available, falling back to deterministic template.
   */
  public async draftReply(input: DraftReplyInput, useModel = false): Promise<DraftReplyResponse> {
    const hasUserFee = Boolean(input.proposedFee && input.proposedFee.trim().length > 0);
    const hasUserTimeline = Boolean(input.proposedTimeline && input.proposedTimeline.trim().length > 0);

    if (!useModel) {
      return this.generateDeterministicReply(input);
    }

    try {
      const { systemPrompt, userPrompt } = buildReplyDraftPrompt(
        input.assessment,
        input.proposedFee,
        input.proposedTimeline,
        input.userCustomNote
      );

      const res = await this.ollamaService.chatJson<{ draftReply: string }>(systemPrompt, userPrompt);
      if (res && res.draftReply && typeof res.draftReply === 'string' && res.draftReply.trim().length > 0) {
        return {
          draftReply: res.draftReply.trim(),
          includesUserFee: hasUserFee,
          includesUserTimeline: hasUserTimeline,
          warnings: [],
        };
      }
    } catch {
      // Model failed, use deterministic template
    }

    return this.generateDeterministicReply(input);
  }
}

export const defaultReplyDraftingService = new ReplyDraftingService();
