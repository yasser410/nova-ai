import axios, { AxiosInstance } from 'axios';
import {
  ProviderInterface,
  ProviderConfig,
  ProviderType,
  AIMessage,
  AIResponse,
  AIRequestOptions,
  ProviderHealthStatus,
  ModelInfo,
} from '@nova/types';
import { NovaLogger } from '../logger';

class AnthropicProvider implements ProviderInterface {
  private client: AxiosInstance;
  private config: ProviderConfig;
  private logger: NovaLogger;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.logger = new NovaLogger('AnthropicProvider');

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.anthropic.com/v1',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 30000,
    });
  }

  getConfig(): ProviderConfig {
    return this.config;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Anthropic provider');
    await this.getHealth();
  }

  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.getHealth();
      return health.healthy;
    } catch {
      return false;
    }
  }

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    try {
      const response = await this.client.post('/messages', {
        model: options?.model || 'claude-3-opus-20240229',
        max_tokens: options?.maxTokens || 2000,
        messages: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        system: messages.find((m) => m.role === 'system')?.content,
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP ?? 1,
      });

      return {
        content: response.data.content[0].text,
        model: response.data.model,
        provider: ProviderType.ANTHROPIC,
        tokensUsed: {
          input: response.data.usage.input_tokens,
          output: response.data.usage.output_tokens,
          total: response.data.usage.input_tokens + response.data.usage.output_tokens,
        },
        finishReason: response.data.stop_reason as any,
      };
    } catch (error) {
      this.logger.error('Chat request failed', error as Error);
      throw error;
    }
  }

  async *chatStream(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): AsyncGenerator<string> {
    try {
      const response = await this.client.post(
        '/messages',
        {
          model: options?.model || 'claude-3-opus-20240229',
          max_tokens: options?.maxTokens || 2000,
          messages: messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
          system: messages.find((m) => m.role === 'system')?.content,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter((l: string) => l.trim());
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                yield data.delta.text;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Stream request failed', error as Error);
      throw error;
    }
  }

  async generateText(prompt: string, options?: AIRequestOptions): Promise<string> {
    const response = await this.chat(
      [{ role: 'user', content: prompt }],
      options
    );
    return response.content;
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: ProviderType.ANTHROPIC,
        maxTokens: 200000,
        supportsFunctions: true,
        supportsVision: true,
        supportsStreaming: true,
        contextWindow: 200000,
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        provider: ProviderType.ANTHROPIC,
        maxTokens: 200000,
        supportsFunctions: true,
        supportsVision: true,
        supportsStreaming: true,
        contextWindow: 200000,
      },
    ];
  }

  async getHealth(): Promise<ProviderHealthStatus> {
    const startTime = Date.now();
    try {
      await this.client.post('/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      });

      return {
        provider: ProviderType.ANTHROPIC,
        healthy: true,
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        provider: ProviderType.ANTHROPIC,
        healthy: false,
        lastChecked: new Date(),
        error: (error as any).message || 'Unknown error',
      };
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    // Claude 3 Opus pricing: $0.015 per 1k input, $0.075 per 1k output
    return (inputTokens * 0.015 + outputTokens * 0.075) / 1000;
  }
}

export { AnthropicProvider };
