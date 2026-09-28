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

class OllamaProvider implements ProviderInterface {
  private client: AxiosInstance;
  private config: ProviderConfig;
  private logger: NovaLogger;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.logger = new NovaLogger('OllamaProvider');

    this.client = axios.create({
      baseURL: config.baseUrl || 'http://localhost:11434',
      timeout: config.timeout || 60000, // Longer timeout for local models
    });
  }

  getConfig(): ProviderConfig {
    return this.config;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Ollama provider');
    await this.getHealth();
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/api/tags');
      return true;
    } catch {
      return false;
    }
  }

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    try {
      const model = options?.model || 'llama2';
      const response = await this.client.post('/api/chat', {
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens || 2000,
          top_p: options?.topP ?? 1,
        },
      });

      return {
        content: response.data.message.content,
        model,
        provider: ProviderType.OLLAMA,
        tokensUsed: {
          input: response.data.prompt_eval_count || 0,
          output: response.data.eval_count || 0,
          total: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0),
        },
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
      const model = options?.model || 'llama2';
      const response = await this.client.post(
        '/api/chat',
        {
          model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens || 2000,
          },
        },
        {
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        try {
          const data = JSON.parse(chunk.toString());
          if (data.message?.content) {
            yield data.message.content;
          }
        } catch {
          // Skip invalid JSON
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
      const response = await this.client.get('/api/tags');
      return response.data.models.map((m: any) => ({
        id: m.name,
        name: m.name,
        provider: ProviderType.OLLAMA,
        maxTokens: 2048,
        supportsFunctions: false,
        supportsVision: false,
        supportsStreaming: true,
        contextWindow: 4096,
      }));
    } catch (error) {
      this.logger.warn('Failed to fetch models from Ollama', (error as any).message);
      return [];
    }
  }

  async getHealth(): Promise<ProviderHealthStatus> {
    const startTime = Date.now();
    try {
      await this.client.get('/api/tags');
      return {
        provider: ProviderType.OLLAMA,
        healthy: true,
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        provider: ProviderType.OLLAMA,
        healthy: false,
        lastChecked: new Date(),
        error: (error as any).message || 'Connection failed',
      };
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    // Ollama is local, so no cost
    return 0;
  }
}

export { OllamaProvider };
