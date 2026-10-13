import { z } from 'zod';
import { DecisionStatusEnum, EvidenceItemSchema, MAX_REQUEST_CHARS } from './common.schema.js';
import { ExtractedScopeSchema } from './agreement.schema.js';

export const CompareRequestInputSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  originalAgreementText: z.string().min(10, 'Original agreement text is required'),
  approvedScope: ExtractedScopeSchema,
  newClientRequest: z
    .string()
    .min(5, 'Client request must be at least 5 characters')
    .max(MAX_REQUEST_CHARS, `Client request must not exceed ${MAX_REQUEST_CHARS} characters`),
  model: z.string().optional()
});

export type CompareRequestInput = z.infer<typeof CompareRequestInputSchema>;

export const ScopeAssessmentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  primaryStatus: DecisionStatusEnum,
  shortSummary: z.string().min(1),
  requestedChangesIdentified: z.array(z.string()).default([]),
  relevantOriginalScopeItems: z.array(z.string()).default([]),
  supportingQuotations: z.array(EvidenceItemSchema).default([]),
  missingOrAmbiguousInfo: z.array(z.string()).default([]),
  suggestedNextStep: z.string().min(1),
  draftReply: z.string().default(''),
  evidenceValidationWarnings: z.array(z.string()).default([]),
  evaluatedAt: z.string()
});

export type ScopeAssessment = z.infer<typeof ScopeAssessmentSchema>;
