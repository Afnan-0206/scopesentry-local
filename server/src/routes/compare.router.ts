import { Router, Request, Response, NextFunction } from 'express';
import {
  CompareRequestInputSchema,
  ScopeAssessment,
  DecisionStatusEnum,
  EvidenceItem
} from '@scopesentry/shared';
import { validateBody } from '../middleware/validate.middleware.js';
import { defaultOllamaService } from '../services/ollama.service.js';
import { buildScopeComparisonPrompt } from '../prompts/scope-compare.prompt.js';
import { EvidenceVerifierService } from '../services/evidence-verifier.service.js';
import { defaultReplyDraftingService } from '../services/reply-drafting.service.js';

export const compareRouter = Router();

compareRouter.post(
  '/',
  validateBody(CompareRequestInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, originalAgreementText, approvedScope, newClientRequest, model } = req.body;

      const { systemPrompt, userPrompt } = buildScopeComparisonPrompt(
        originalAgreementText,
        approvedScope,
        newClientRequest
      );

      let rawModelOutput: any;
      try {
        rawModelOutput = await defaultOllamaService.chatJson<any>(systemPrompt, userPrompt, model);
      } catch (err: any) {
        res.status(503).json({
          error: `Local model comparison failed: ${err.message}`,
          code: 'MODEL_INFERENCE_FAILED',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!rawModelOutput || typeof rawModelOutput !== 'object') {
        res.status(502).json({
          error: 'Model returned empty or non-object response.',
          code: 'INVALID_MODEL_OUTPUT',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate primary status
      let primaryStatus = rawModelOutput.primaryStatus;
      if (!DecisionStatusEnum.options.includes(primaryStatus)) {
        // Fall back conservatively to NEEDS CLARIFICATION if invalid status was returned
        primaryStatus = 'NEEDS CLARIFICATION';
      }

      const shortSummary = String(rawModelOutput.shortSummary || 'Scope assessment completed.');
      const requestedChangesIdentified = Array.isArray(rawModelOutput.requestedChangesIdentified)
        ? rawModelOutput.requestedChangesIdentified.map(String)
        : [];
      const relevantOriginalScopeItems = Array.isArray(rawModelOutput.relevantOriginalScopeItems)
        ? rawModelOutput.relevantOriginalScopeItems.map(String)
        : [];
      const missingOrAmbiguousInfo = Array.isArray(rawModelOutput.missingOrAmbiguousInfo)
        ? rawModelOutput.missingOrAmbiguousInfo.map(String)
        : [];
      const suggestedNextStep = String(
        rawModelOutput.suggestedNextStep || 'Discuss request with client before starting work.'
      );

      // Raw quotations from model
      const rawQuotes = Array.isArray(rawModelOutput.supportingQuotations)
        ? rawModelOutput.supportingQuotations.map((q: any) => ({
            id: Math.random().toString(36).substring(2, 9),
            quote: String(q.quote || ''),
            whyItMatters: String(q.whyItMatters || ''),
            isVerified: false,
          }))
        : [];

      // MANDATORY EVIDENCE VERIFICATION
      const verification = EvidenceVerifierService.verifyEvidenceItems(
        originalAgreementText,
        rawQuotes
      );

      const validationWarnings: string[] = [...verification.warnings];

      // Conservative rule: If the model relied on quotations that could not be validated,
      // warn the user explicitly and prevent unverified citations from being displayed as confirmed.
      if (verification.unverifiedItems.length > 0) {
        validationWarnings.push(
          `${verification.unverifiedItems.length} supporting quotation(s) cited by the model could not be verified in the source agreement text.`
        );

        // If the model claimed POTENTIAL SCOPE CHANGE or INCLUDED solely based on unverified evidence
        if (verification.verifiedItems.length === 0 && rawQuotes.length > 0) {
          primaryStatus = 'NEEDS CLARIFICATION';
          validationWarnings.push(
            'Classification adjusted to "NEEDS CLARIFICATION" because required source agreement evidence could not be verified.'
          );
        }
      }

      const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      let draftReply = typeof rawModelOutput.draftReply === 'string' ? rawModelOutput.draftReply : '';
      if (!draftReply || draftReply.trim().length === 0) {
        const generated = defaultReplyDraftingService.generateDeterministicReply({
          assessment: {
            id: assessmentId,
            projectId,
            primaryStatus,
            shortSummary,
            requestedChangesIdentified,
            relevantOriginalScopeItems,
            supportingQuotations: verification.allWithStatus,
            missingOrAmbiguousInfo,
            suggestedNextStep,
            draftReply: '',
            evidenceValidationWarnings: validationWarnings,
            evaluatedAt: new Date().toISOString(),
          },
        });
        draftReply = generated.draftReply;
      }

      const assessmentResult: ScopeAssessment = {
        id: assessmentId,
        projectId,
        primaryStatus,
        shortSummary,
        requestedChangesIdentified,
        relevantOriginalScopeItems,
        supportingQuotations: verification.allWithStatus,
        missingOrAmbiguousInfo,
        suggestedNextStep,
        draftReply,
        evidenceValidationWarnings: validationWarnings,
        evaluatedAt: new Date().toISOString(),
      };

      res.json(assessmentResult);
    } catch (err) {
      next(err);
    }
  }
);
