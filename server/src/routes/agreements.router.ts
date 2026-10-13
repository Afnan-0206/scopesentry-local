import { Router, Request, Response, NextFunction } from 'express';
import {
  AnalyzeAgreementInputSchema,
  ExtractedScopeSchema,
  AnalyzeAgreementResponse
} from '@scopesentry/shared';
import { validateBody } from '../middleware/validate.middleware.js';
import { defaultOllamaService } from '../services/ollama.service.js';
import { buildAgreementExtractionPrompt } from '../prompts/agreement-extract.prompt.js';
import { EvidenceVerifierService } from '../services/evidence-verifier.service.js';

export const agreementsRouter = Router();

agreementsRouter.post(
  '/analyze',
  validateBody(AnalyzeAgreementInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { originalAgreementText, model } = req.body;

      const { systemPrompt, userPrompt } = buildAgreementExtractionPrompt(originalAgreementText);

      // Request structured extraction from local Ollama
      let rawExtraction: any;
      try {
        rawExtraction = await defaultOllamaService.chatJson<any>(systemPrompt, userPrompt, model);
      } catch (err: any) {
        res.status(503).json({
          error: `Local model extraction failed: ${err.message}`,
          code: 'MODEL_INFERENCE_FAILED',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate extraction with Zod schema
      const parseResult = ExtractedScopeSchema.safeParse(rawExtraction);
      if (!parseResult.success) {
        res.status(502).json({
          error: 'The local model returned a scope structure that does not match the required schema.',
          code: 'INVALID_MODEL_OUTPUT_SCHEMA',
          details: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Mandatory Evidence Verification Layer: verify all verbatim quotes against the original text
      const verification = EvidenceVerifierService.verifyExtractedScope(
        originalAgreementText,
        parseResult.data
      );

      const responsePayload: AnalyzeAgreementResponse = {
        extractedScope: verification.scope,
        verifiedQuotesCount: verification.verifiedCount,
        unverifiedQuotesCount: verification.unverifiedCount,
        warnings: verification.warnings,
      };

      res.json(responsePayload);
    } catch (err) {
      next(err);
    }
  }
);
