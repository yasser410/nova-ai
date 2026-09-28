import { Express, Request, Response } from 'express';
import { NovaCore } from '@nova/core';
import { NovaLogger } from '@nova/core';

const logger = new NovaLogger('DiagnosticsEndpoint');

export function setupDiagnosticsEndpoint(app: Express, novaCore: NovaCore) {
  // Diagnostics endpoint
  app.get('/api/diagnostics', async (req: Request, res: Response) => {
    try {
      const providerHealth = await novaCore.getProviderManager().getProviderHealth();
      const availableProviders = await novaCore
        .getProviderManager()
        .getAvailableProviders();

      const diagnostics = {
        timestamp: new Date().toISOString(),
        status: availableProviders.length > 0 ? 'operational' : 'degraded',
        providers: {
          total: providerHealth.length,
          healthy: providerHealth.filter((p) => p.healthy).length,
          details: providerHealth,
        },
        agents: {
          total: novaCore.getAgentRegistry().getAll().size,
          registered: Array.from(novaCore.getAgentRegistry().getAll().keys()),
        },
        tools: {
          total: novaCore.getToolRegistry().getAll().size,
          registered: Array.from(novaCore.getToolRegistry().getAll().keys()),
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          version: '1.0.0',
          developer: 'الحاج ياسر',
        },
      };

      res.json({
        success: true,
        data: diagnostics,
      });
    } catch (error) {
      logger.error('Diagnostics check failed', error as Error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DIAGNOSTICS_ERROR',
          message: (error as any).message || 'Failed to run diagnostics',
        },
      });
    }
  });
}
