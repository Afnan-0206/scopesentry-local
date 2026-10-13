import { Router, Request, Response } from 'express';
import { defaultOllamaService } from '../services/ollama.service.js';

export const modelsRouter = Router();

modelsRouter.get('/', async (req: Request, res: Response) => {
  const result = await defaultOllamaService.listModels();
  res.json(result);
});

modelsRouter.post('/select', (req: Request, res: Response) => {
  const { model } = req.body;
  if (!model || typeof model !== 'string') {
    res.status(400).json({ error: 'Model name is required.' });
    return;
  }
  defaultOllamaService.setConfiguredModel(model);
  res.json({ success: true, configured: model });
});
