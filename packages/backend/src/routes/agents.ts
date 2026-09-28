import { Router, Request, Response } from 'express';
import { NovaCore } from '@nova/core';

export default function agentRoutes(novaCore: NovaCore) {
  const router = Router();

  // GET /api/agents - List all agents
  router.get('/', (req: Request, res: Response) => {
    try {
      const agents = novaCore.getAgentRegistry().getAll();
      const agentsList = Array.from(agents.values()).map((agent) => agent.getConfig());

      res.json({
        success: true,
        data: agentsList,
        total: agentsList.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'FETCH_ERROR',
          message: (error as any).message || 'Failed to fetch agents',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // GET /api/agents/:id - Get specific agent
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const agent = novaCore.getAgentRegistry().get(id);

      if (!agent) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Agent ${id} not found`,
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.json({
        success: true,
        data: {
          config: agent.getConfig(),
          capabilities: agent.getCapabilities(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'FETCH_ERROR',
          message: (error as any).message || 'Failed to fetch agent',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // POST /api/agents/:id/run - Execute agent
  router.post('/:id/run', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { input, conversationId } = req.body;

      const agent = novaCore.getAgentRegistry().get(id);
      if (!agent) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Agent ${id} not found`,
            timestamp: new Date().toISOString(),
          },
        });
      }

      const agentRequest = {
        id: `req_${Date.now()}`,
        agentId: id,
        input,
        conversationId,
      };

      const response = await agent.execute(agentRequest);

      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'EXECUTION_ERROR',
          message: (error as any).message || 'Failed to execute agent',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  return router;
}
