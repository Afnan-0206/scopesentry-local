import { Router, Request, Response, NextFunction } from 'express';
import { DraftReplyInputSchema } from '@scopesentry/shared';
import { validateBody } from '../middleware/validate.middleware.js';
import { defaultReplyDraftingService } from '../services/reply-drafting.service.js';

export const replyRouter = Router();

replyRouter.post(
  '/draft',
  validateBody(DraftReplyInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await defaultReplyDraftingService.draftReply(req.body, false);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);
