import { Router, Request, Response } from 'express';
import { NovaCore } from '@nova/core';
import { ChatRequest } from '@nova/types';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
  agentId: z.string().optional(),
  stream: z.boolean().optional().default(false),
});

export default function chatRoutes(novaCore: NovaCore) {
  const router = Router();

  // POST /api/chat - Send a message
  router.post('/', async (req: Request, res: Response) => {
    try {
      const validatedData = ChatRequestSchema.parse(req.body);

      if (validatedData.stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
          for await (const chunk of novaCore.chatStream(validatedData)) {
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
          }
          res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
          res.end();
        } catch (error) {
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              error: (error as any).message,
            })}\n\n`
          );
          res.end();
        }
      } else {
        const response = await novaCore.chat(validatedData);
        res.json({
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        res.status(500).json({
          error: {
            code: 'CHAT_ERROR',
            message: (error as any).message || 'Failed to process chat request',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  });

  // GET /api/chat/conversations/:id - Get conversation
  router.get('/conversations/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversation = await novaCore.getConversation(id);

      if (!conversation) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Conversation ${id} not found`,
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.json({
        success: true,
        data: conversation,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'FETCH_ERROR',
          message: (error as any).message || 'Failed to fetch conversation',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // DELETE /api/chat/conversations/:id - Delete conversation
  router.delete('/conversations/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await novaCore.deleteConversation(id);

      res.json({
        success: true,
        message: `Conversation ${id} deleted`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'DELETE_ERROR',
          message: (error as any).message || 'Failed to delete conversation',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // POST /api/chat/conversations - Create new conversation
  router.post('/conversations', async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversationId = await novaCore.createConversation('default-user', title);

      res.status(201).json({
        success: true,
        data: { conversationId },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'CREATE_ERROR',
          message: (error as any).message || 'Failed to create conversation',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  return router;
}
