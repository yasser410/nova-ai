import { Router, Request, Response } from 'express';
import { NovaCore } from '@nova/core';

export default function toolRoutes(novaCore: NovaCore) {
  const router = Router();

  // GET /api/tools - List all tools
  router.get('/', (req: Request, res: Response) => {
    try {
      const tools = novaCore.getToolRegistry().getAll();
      const toolsList = Array.from(tools.values()).map((tool) => tool.getConfig());

      res.json({
        success: true,
        data: toolsList,
        total: toolsList.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'FETCH_ERROR',
          message: (error as any).message || 'Failed to fetch tools',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // GET /api/tools/:id - Get specific tool
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tool = novaCore.getToolRegistry().get(id);

      if (!tool) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Tool ${id} not found`,
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.json({
        success: true,
        data: tool.getConfig(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'FETCH_ERROR',
          message: (error as any).message || 'Failed to fetch tool',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // POST /api/tools/:id/run - Execute tool
  router.post('/:id/run', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { input } = req.body;

      const tool = novaCore.getToolRegistry().get(id);
      if (!tool) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Tool ${id} not found`,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Validate input
      const isValid = await tool.validate(input);
      if (!isValid) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid tool input',
            timestamp: new Date().toISOString(),
          },
        });
      }

      const execution = {
        id: `exec_${Date.now()}`,
        toolId: id,
        input,
      };

      const result = await tool.execute(execution);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'EXECUTION_ERROR',
          message: (error as any).message || 'Failed to execute tool',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  return router;
}
