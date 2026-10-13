import { z } from 'zod';
import { MAX_AGREEMENT_CHARS } from './common.schema.js';

export const ScopeItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  text: z.string().min(1, 'Item description cannot be empty'),
  verbatimQuote: z.string().optional().default(''),
  isVerified: z.boolean().default(false),
  startIndex: z.number().int().nonnegative().optional(),
  endIndex: z.number().int().nonnegative().optional(),
  warning: z.string().optional()
});

export type ScopeItem = z.infer<typeof ScopeItemSchema>;

export const ExtractedScopeSchema = z.object({
  deliverables: z.array(ScopeItemSchema).default([]),
  explicitInclusions: z.array(ScopeItemSchema).default([]),
  explicitExclusions: z.array(ScopeItemSchema).default([]),
  constraints: z.array(ScopeItemSchema).default([]),
  revisionPolicy: ScopeItemSchema.nullable().default(null),
  milestonesAndDeadlines: z.array(ScopeItemSchema).default([]),
  assumptions: z.array(z.string()).default([]),
  ambiguousOrConflictingClauses: z.array(z.string()).default([]),
  evidenceExcerpts: z.array(z.string()).default([])
});

export type ExtractedScope = z.infer<typeof ExtractedScopeSchema>;

export const AnalyzeAgreementInputSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(100, 'Project name must be at most 100 characters'),
  clientLabel: z.string().max(100).optional().default(''),
  originalAgreementText: z
    .string()
    .min(10, 'Agreement text must be at least 10 characters')
    .max(MAX_AGREEMENT_CHARS, `Agreement text must not exceed ${MAX_AGREEMENT_CHARS} characters`),
  notes: z.string().max(5000).optional().default(''),
  model: z.string().optional()
});

export type AnalyzeAgreementInput = z.infer<typeof AnalyzeAgreementInputSchema>;

export const AnalyzeAgreementResponseSchema = z.object({
  extractedScope: ExtractedScopeSchema,
  verifiedQuotesCount: z.number().int().nonnegative(),
  unverifiedQuotesCount: z.number().int().nonnegative(),
  warnings: z.array(z.string()).default([])
});

export type AnalyzeAgreementResponse = z.infer<typeof AnalyzeAgreementResponseSchema>;

export const ProjectAgreementSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  clientLabel: z.string().optional(),
  originalAgreementText: z.string(),
  notes: z.string().optional(),
  extractedScope: ExtractedScopeSchema,
  approvedScope: ExtractedScopeSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export type ProjectAgreement = z.infer<typeof ProjectAgreementSchema>;
