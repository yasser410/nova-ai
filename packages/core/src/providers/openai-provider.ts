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

class OpenAIProvider implements ProviderInterface {
  private client: AxiosInstance;
  private config: ProviderConfig;
  private logger: NovaLogger;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.logger = new NovaLogger('OpenAIProvider');

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.openai.com/v1',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: config.timeout || 30000,
    });
  }

  getConfig(): ProviderConfig {
    return this.config;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing OpenAI provider');
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
      const response = await this.client.post('/chat/completions', {
        model: options?.model || 'gpt-4',
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens || 2000,
        top_p: options?.topP ?? 1,
        frequency_penalty: options?.frequencyPenalty ?? 0,
        presence_penalty: options?.presencePenalty ?? 0,
      });

      const data = response.data;

      return {
        content: data.choices[0].message.content,
        model: data.model,
        provider: ProviderType.OPENAI,
        tokensUsed: {
          input: data.usage.prompt_tokens,
          output: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        },
        finishReason: data.choices[0].finish_reason as any,
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
        '/chat/completions',
        {
          model: options?.model || 'gpt-4',
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens || 2000,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line: string) => line.trim().startsWith('data: '));

        for (const line of lines) {
          const message = line.replace(/^data: /, '').trim();
          if (message === '[DONE]') break;

          try {
            const parsed = JSON.parse(message);
            if (parsed.choices[0].delta.content) {
              yield parsed.choices[0].delta.content;
            }
          } catch {
            // Skip invalid JSON
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
    try {
      const response = await this.client.get('/models');
      return response.data.data
        .filter((m: any) => m.id.includes('gpt'))
        .map((m: any) => ({
          id: m.id,
          name: m.id,
          provider: ProviderType.OPENAI,
          maxTokens: 4096,
          supportsFunctions: true,
          supportsVision: m.id.includes('vision'),
          supportsStreaming: true,
          contextWindow: 8192,
        }));
    } catch (error) {
      this.logger.error('Failed to fetch models', error as Error);
      return [];
    }
  }

  async getHealth(): Promise<ProviderHealthStatus> {
    const startTime = Date.now();
    try {
      await this.client.get('/models');
      const responseTime = Date.now() - startTime;

      return {
        provider: ProviderType.OPENAI,
        healthy: true,
        lastChecked: new Date(),
        responseTime,
      };
    } catch (error) {
      return {
        provider: ProviderType.OPENAI,
        healthy: false,
        lastChecked: new Date(),
        error: (error as any).message || 'Unknown error',
      };
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    // GPT-4 pricing: $0.03 per 1k input, $0.06 per 1k output
    return (inputTokens * 0.03 + outputTokens * 0.06) / 1000;
  }
}

export { OpenAIProvider };
