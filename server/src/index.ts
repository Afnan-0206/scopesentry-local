import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import { healthRouter } from './routes/health.router.js';
import { modelsRouter } from './routes/models.router.js';
import { agreementsRouter } from './routes/agreements.router.js';
import { compareRouter } from './routes/compare.router.js';
import { replyRouter } from './routes/reply.router.js';
import { errorHandler } from './middleware/error-handler.middleware.js';

export const app = express();

// Security: restrict CORS to configured frontend origin
app.use(
  cors({
    origin: [
      CONFIG.FRONTEND_ORIGIN,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3001',
      'http://127.0.0.1:3001'
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/models', modelsRouter);
app.use('/api/agreements', agreementsRouter);
app.use('/api/compare', compareRouter);
app.use('/api/replies', replyRouter);

// Centralized error handling
app.use(errorHandler);

// Only listen if not imported by test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`[ScopeSentry Local Backend] Running at http://${CONFIG.HOST}:${CONFIG.PORT}`);
    console.log(`[Privacy] Bound strictly to loopback (${CONFIG.HOST}). No third-party AI APIs configured.`);
  });
}
