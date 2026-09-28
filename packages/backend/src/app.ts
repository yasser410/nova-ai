import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { NovaCore } from '@nova/core';
import { OpenAIProvider } from '@nova/core';
import { ProviderType, ProviderConfig } from '@nova/types';
import { NovaLogger } from '@nova/core';
import chatRoutes from './routes/chat';
import agentRoutes from './routes/agents';
import toolRoutes from './routes/tools';
import healthRoutes from './routes/health';

const logger = new NovaLogger('BackendServer');
const app: Express = express();
const novaCore = new NovaCore();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(pinoHttp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_REQUESTS ? parseInt(process.env.RATE_LIMIT_REQUESTS) : 100,
  message: 'Too many requests, please try again later.',
});

app.use('/api/', limiter);

// Initialize providers
async function initializeProviders() {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const openaiConfig: ProviderConfig = {
      id: 'openai-primary',
      type: ProviderType.OPENAI,
      name: 'OpenAI',
      apiKey: openaiKey,
      enabled: true,
      priority: 1,
      timeout: 30000,
    };

    const openaiProvider = new OpenAIProvider(openaiConfig);
    novaCore.getProviderManager().registerProvider(openaiConfig, openaiProvider);
    logger.info('OpenAI provider registered');
  } else {
    logger.warn('OPENAI_API_KEY not configured');
  }

  // Add more providers as needed
}

// Routes
app.use('/api/chat', chatRoutes(novaCore));
app.use('/api/agents', agentRoutes(novaCore));
app.use('/api/tools', toolRoutes(novaCore));
app.use('/api/health', healthRoutes(novaCore));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'Nova Backend API',
    developer: 'الحاج ياسر',
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Nova AI Platform',
    version: '1.0.0',
    developer: 'الحاج ياسر',
    description: 'Enterprise AI Platform with Multi-Agent Architecture',
    endpoints: {
      chat: '/api/chat',
      agents: '/api/agents',
      tools: '/api/tools',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      timestamp: new Date().toISOString(),
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
    },
  });
});

export { app, novaCore, initializeProviders, logger };
