import { z } from 'zod';

export const MAX_AGREEMENT_CHARS = 20000;
export const MAX_REQUEST_CHARS = 10000;

export const DecisionStatusEnum = z.enum([
  'INCLUDED',
  'POTENTIAL SCOPE CHANGE',
  'NEEDS CLARIFICATION'
]);

export type DecisionStatus = z.infer<typeof DecisionStatusEnum>;

export const EvidenceItemSchema = z.object({
  id: z.string(),
  quote: z.string().min(1),
  whyItMatters: z.string().default(''),
  isVerified: z.boolean().default(false),
  startIndex: z.number().int().nonnegative().optional(),
  endIndex: z.number().int().nonnegative().optional(),
  warning: z.string().optional()
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.any().optional(),
  timestamp: z.string()
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
