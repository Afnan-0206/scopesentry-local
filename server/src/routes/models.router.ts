import { Router, Request, Response } from 'express';
import { defaultOllamaService } from '../services/ollama.service.js';

export const modelsRouter = Router();

modelsRouter.get('/', async (req: Request, res: Response) => {
  const result = await defaultOllamaService.listModels();
  res.json(result);
});
