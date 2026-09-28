/**
 * Nova Core Engine
 * Central orchestration system for multi-agent AI platform
 */

import { ProviderManager } from '../providers';
import { NovaAgentRegistry, NovaToolRegistry } from '../registry';
import { NovaLogger } from '../logger';
import {
  AIMessage,
  AIResponse,
  AIRequestOptions,
  ChatRequest,
  ChatResponse,
  Conversation,
  Message,
} from '@nova/types';

interface ConversationState {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class NovaCore {
  private providerManager: ProviderManager;
  private agentRegistry: NovaAgentRegistry;
  private toolRegistry: NovaToolRegistry;
  private logger: NovaLogger;
  private conversations: Map<string, ConversationState> = new Map();
  private conversationHistory: Map<string, AIMessage[]> = new Map();

  constructor() {
    this.providerManager = new ProviderManager();
    this.agentRegistry = new NovaAgentRegistry();
    this.toolRegistry = new NovaToolRegistry();
    this.logger = new NovaLogger('NovaCore');
  }

  getProviderManager(): ProviderManager {
    return this.providerManager;
  }

  getAgentRegistry(): NovaAgentRegistry {
    return this.agentRegistry;
  }

  getToolRegistry(): NovaToolRegistry {
    return this.toolRegistry;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Nova Core');
    // Initialize all providers
    this.logger.info('Nova Core initialization complete');
  }

  async createConversation(userId: string, title?: string): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const conversation: ConversationState = {
      id: conversationId,
      userId,
      title: title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.set(conversationId, conversation);
    this.conversationHistory.set(conversationId, []);

    this.logger.info(`Conversation created: ${conversationId}`, { userId });
    return conversationId;
  }

  async getConversation(conversationId: string): Promise<ConversationState | null> {
    return this.conversations.get(conversationId) || null;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { conversationId: providedConvId, message, agentId, stream } = request;

    let conversationId = providedConvId;
    if (!conversationId) {
      conversationId = await this.createConversation('default-user');
    }

    // Get or initialize conversation history
    let messages = this.conversationHistory.get(conversationId) || [];
    if (messages.length === 0) {
      messages = [
        {
          role: 'system',
          content:
            'You are Nova, an advanced AI assistant developed by الحاج ياسر. You are helpful, knowledgeable, and professional.',
        },
      ];
    }

    // Add user message
    messages.push({
      role: 'user',
      content: message,
    });

    this.logger.info('Processing chat request', {
      conversationId,
      messageLength: message.length,
    });

    try {
      // Get AI response
      const aiResponse = await this.providerManager.chat(messages, {
        model: 'gpt-4',
        temperature: 0.7,
      });

      // Add assistant response to history
      messages.push({
        role: 'assistant',
        content: aiResponse.content,
      });

      // Store updated history
      this.conversationHistory.set(conversationId, messages);

      // Update conversation
      const conv = this.conversations.get(conversationId);
      if (conv) {
        conv.updatedAt = new Date();
        conv.messages = messages;
      }

      const response: ChatResponse = {
        conversationId,
        messageId: `msg_${Date.now()}`,
        content: aiResponse.content,
        agentId: agentId || 'general-assistant',
        tokensUsed: aiResponse.tokensUsed,
      };

      this.logger.info('Chat request processed successfully', {
        conversationId,
        messageId: response.messageId,
      });

      return response;
    } catch (error) {
      this.logger.error('Chat request failed', error as Error, { conversationId });
      throw error;
    }
  }

  async *chatStream(
    request: ChatRequest
  ): AsyncGenerator<string> {
    const { conversationId: providedConvId, message, agentId } = request;

    let conversationId = providedConvId;
    if (!conversationId) {
      conversationId = await this.createConversation('default-user');
    }

    // Get or initialize conversation history
    let messages = this.conversationHistory.get(conversationId) || [];
    if (messages.length === 0) {
      messages = [
        {
          role: 'system',
          content:
            'You are Nova, an advanced AI assistant developed by الحاج ياسر. You are helpful, knowledgeable, and professional.',
        },
      ];
    }

    // Add user message
    messages.push({
      role: 'user',
      content: message,
    });

    try {
      let fullResponse = '';

      for await (const chunk of this.providerManager.chatStream(messages)) {
        fullResponse += chunk;
        yield chunk;
      }

      // Add assistant response to history
      messages.push({
        role: 'assistant',
        content: fullResponse,
      });

      // Store updated history
      this.conversationHistory.set(conversationId, messages);

      // Update conversation
      const conv = this.conversations.get(conversationId);
      if (conv) {
        conv.updatedAt = new Date();
        conv.messages = messages;
      }
    } catch (error) {
      this.logger.error('Stream chat failed', error as Error, { conversationId });
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);
    this.conversationHistory.delete(conversationId);
    this.logger.info(`Conversation deleted: ${conversationId}`);
  }

  async clearConversationHistory(conversationId: string): Promise<void> {
    this.conversationHistory.set(conversationId, []);
    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.messages = [];
    }
    this.logger.info(`Conversation history cleared: ${conversationId}`);
  }
}

export { NovaCore };
