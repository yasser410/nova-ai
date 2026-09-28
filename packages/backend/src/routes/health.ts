import { Router, Request, Response } from 'express';
import { NovaCore } from '@nova/core';

export default function healthRoutes(novaCore: NovaCore) {
  const router = Router();

  // GET /api/health - System health status
  router.get('/', async (req: Request, res: Response) => {
    try {
      const providerHealth = await novaCore.getProviderManager().getProviderHealth();

      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          providers: providerHealth,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: (error as any).message || 'Failed to check health',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // GET /api/health/providers - Provider health status
  router.get('/providers', async (req: Request, res: Response) => {
    try {
      const health = await novaCore.getProviderManager().getProviderHealth();

      res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: (error as any).message || 'Failed to check provider health',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  return router;
}
