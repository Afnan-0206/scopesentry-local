import { Router, Request, Response } from 'express';
import { defaultOllamaService } from '../services/ollama.service.js';
import { CONFIG } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  const ollamaHealth = await defaultOllamaService.getHealth();

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'ScopeSentry Local Backend',
    privacy: {
      boundHost: CONFIG.HOST,
      isLoopback: CONFIG.HOST === '127.0.0.1' || CONFIG.HOST === 'localhost',
      externalThirdPartyAiApis: false,
      telemetry: false,
    },
    ollama: ollamaHealth,
  });
});
