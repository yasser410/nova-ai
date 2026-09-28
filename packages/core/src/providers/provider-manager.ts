import {
  ProviderType,
  ProviderConfig,
  ProviderInterface,
  AIMessage,
  AIResponse,
  AIRequestOptions,
  ProviderHealthStatus,
} from '@nova/types';
import { NovaLogger } from '../logger';

class ProviderManager {
  private providers: Map<string, ProviderInterface> = new Map();
  private configs: Map<string, ProviderConfig> = new Map();
  private logger: NovaLogger;
  private healthCache: Map<string, ProviderHealthStatus> = new Map();

  constructor() {
    this.logger = new NovaLogger('ProviderManager');
  }

  registerProvider(config: ProviderConfig, provider: ProviderInterface): void {
    this.configs.set(config.id, config);
    this.providers.set(config.id, provider);
    this.logger.info(`Provider registered: ${config.name}`, { type: config.type });
  }

  async getAvailableProviders(): Promise<ProviderConfig[]> {
    const available: ProviderConfig[] = [];

    for (const [id, config] of this.configs) {
      if (!config.enabled) continue;

      const provider = this.providers.get(id);
      if (provider && (await provider.isAvailable())) {
        available.push(config);
      }
    }

    return available.sort((a, b) => a.priority - b.priority);
  }

  async selectBestProvider(): Promise<ProviderInterface | null> {
    const available = await this.getAvailableProviders();

    if (available.length === 0) {
      this.logger.warn('No providers available');
      return null;
    }

    const provider = this.providers.get(available[0].id);
    this.logger.info(`Selected provider: ${available[0].name}`);
    return provider || null;
  }

  async chat(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse> {
    const provider = await this.selectBestProvider();

    if (!provider) {
      throw new Error('No AI providers available');
    }

    try {
      const response = await provider.chat(messages, options);
      this.logger.info('Chat request successful', {
        model: response.model,
        tokensUsed: response.tokensUsed,
      });
      return response;
    } catch (error) {
      this.logger.error('Chat request failed', error as Error);
      throw error;
    }
  }

  async chatStream(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): AsyncGenerator<string> {
    const provider = await this.selectBestProvider();

    if (!provider) {
      throw new Error('No AI providers available');
    }

    return provider.chatStream(messages, options);
  }

  async getProviderHealth(): Promise<ProviderHealthStatus[]> {
    const health: ProviderHealthStatus[] = [];

    for (const provider of this.providers.values()) {
      try {
        const status = await provider.getHealth();
        health.push(status);
        this.healthCache.set(status.provider, status);
      } catch (error) {
        this.logger.warn(
          `Failed to get health status`,
          (error as any).message || String(error)
        );
      }
    }

    return health;
  }
}

export { ProviderManager };
