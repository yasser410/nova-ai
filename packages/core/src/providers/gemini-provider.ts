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

class GeminiProvider implements ProviderInterface {
  private client: AxiosInstance;
  private config: ProviderConfig;
  private logger: NovaLogger;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.logger = new NovaLogger('GeminiProvider');

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://generativelanguage.googleapis.com/v1',
      timeout: config.timeout || 30000,
    });
  }

  getConfig(): ProviderConfig {
    return this.config;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Google Gemini provider');
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
      const model = options?.model || 'gemini-pro';
      const response = await this.client.post(
        `/models/${model}:generateContent`,
        {
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens || 2000,
            topP: options?.topP ?? 1,
            topK: options?.topK,
          },
        },
        {
          params: {
            key: this.config.apiKey,
          },
        }
      );

      return {
        content: response.data.candidates[0].content.parts[0].text,
        model,
        provider: ProviderType.GOOGLE_GEMINI,
        finishReason: response.data.candidates[0].finishReason as any,
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
      const model = options?.model || 'gemini-pro';
      const response = await this.client.post(
        `/models/${model}:streamGenerateContent`,
        {
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens || 2000,
          },
        },
        {
          params: {
            key: this.config.apiKey,
          },
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        try {
          const text = chunk.toString();
          if (text.startsWith('}')) {
            const data = JSON.parse(text);
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield data.candidates[0].content.parts[0].text;
            }
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
    return [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: ProviderType.GOOGLE_GEMINI,
        maxTokens: 32000,
        supportsFunctions: true,
        supportsVision: false,
        supportsStreaming: true,
        contextWindow: 32000,
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        provider: ProviderType.GOOGLE_GEMINI,
        maxTokens: 32000,
        supportsFunctions: true,
        supportsVision: true,
        supportsStreaming: true,
        contextWindow: 32000,
      },
    ];
  }

  async getHealth(): Promise<ProviderHealthStatus> {
    const startTime = Date.now();
    try {
      await this.client.get('/models', {
        params: {
          key: this.config.apiKey,
        },
      });

      return {
        provider: ProviderType.GOOGLE_GEMINI,
        healthy: true,
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        provider: ProviderType.GOOGLE_GEMINI,
        healthy: false,
        lastChecked: new Date(),
        error: (error as any).message || 'Unknown error',
      };
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    // Gemini pricing: Free tier available, paid: $0.00125 per 1k input
    return (inputTokens * 0.00125) / 1000;
  }
}

export { GeminiProvider };
