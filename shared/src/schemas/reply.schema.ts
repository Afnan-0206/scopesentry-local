import { z } from 'zod';
import { ScopeAssessmentSchema } from './comparison.schema.js';

export const DraftReplyInputSchema = z.object({
  assessment: ScopeAssessmentSchema,
  proposedFee: z.string().max(200).optional().default(''),
  proposedTimeline: z.string().max(200).optional().default(''),
  userCustomNote: z.string().max(1000).optional().default('')
});

export type DraftReplyInput = {
  assessment: z.infer<typeof ScopeAssessmentSchema>;
  proposedFee?: string;
  proposedTimeline?: string;
  userCustomNote?: string;
};

export const DraftReplyResponseSchema = z.object({
  draftReply: z.string(),
  includesUserFee: z.boolean(),
  includesUserTimeline: z.boolean(),
  warnings: z.array(z.string()).default([])
});

export type DraftReplyResponse = z.infer<typeof DraftReplyResponseSchema>;
