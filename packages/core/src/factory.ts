import axios from 'axios';
import { NovaCore } from './core/nova-core';
import { ProviderConfig, ProviderType } from '@nova/types';
import { OpenAIProvider } from './providers/openai-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { GeminiProvider } from './providers/gemini-provider';
import { OllamaProvider } from './providers/ollama-provider';
import { NovaLogger } from './logger';

const logger = new NovaLogger('NovaFactory');

/**
 * Nova Factory - Initialize and configure Nova Core with all providers
 */
export class NovaFactory {
  static async createNovaCore(): Promise<NovaCore> {
    const core = new NovaCore();
    const providerManager = core.getProviderManager();

    logger.info('🚀 Initializing Nova Core with AI Providers');

    // OpenAI Provider
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiConfig: ProviderConfig = {
          id: 'openai-primary',
          type: ProviderType.OPENAI,
          name: 'OpenAI (GPT-4)',
          apiKey: process.env.OPENAI_API_KEY,
          enabled: true,
          priority: 1,
          timeout: 30000,
        };

        const openaiProvider = new OpenAIProvider(openaiConfig);
        providerManager.registerProvider(openaiConfig, openaiProvider);
        logger.info('✅ OpenAI provider registered');
      } catch (error) {
        logger.warn('⚠️  Failed to initialize OpenAI provider', (error as any).message);
      }
    } else {
      logger.warn('⚠️  OPENAI_API_KEY not configured');
    }

    // Anthropic Provider
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropicConfig: ProviderConfig = {
          id: 'anthropic-primary',
          type: ProviderType.ANTHROPIC,
          name: 'Anthropic (Claude)',
          apiKey: process.env.ANTHROPIC_API_KEY,
          enabled: true,
          priority: 2,
          timeout: 30000,
        };

        const anthropicProvider = new AnthropicProvider(anthropicConfig);
        providerManager.registerProvider(anthropicConfig, anthropicProvider);
        logger.info('✅ Anthropic provider registered');
      } catch (error) {
        logger.warn('⚠️  Failed to initialize Anthropic provider', (error as any).message);
      }
    } else {
      logger.warn('⚠️  ANTHROPIC_API_KEY not configured');
    }

    // Google Gemini Provider
    if (process.env.GOOGLE_GEMINI_KEY) {
      try {
        const geminiConfig: ProviderConfig = {
          id: 'gemini-primary',
          type: ProviderType.GOOGLE_GEMINI,
          name: 'Google Gemini',
          apiKey: process.env.GOOGLE_GEMINI_KEY,
          enabled: true,
          priority: 3,
          timeout: 30000,
        };

        const geminiProvider = new GeminiProvider(geminiConfig);
        providerManager.registerProvider(geminiConfig, geminiProvider);
        logger.info('✅ Google Gemini provider registered');
      } catch (error) {
        logger.warn('⚠️  Failed to initialize Gemini provider', (error as any).message);
      }
    } else {
      logger.warn('⚠️  GOOGLE_GEMINI_KEY not configured');
    }

    // Ollama Provider (Local)
    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const ollamaConfig: ProviderConfig = {
        id: 'ollama-local',
        type: ProviderType.OLLAMA,
        name: 'Ollama (Local)',
        baseUrl: ollamaUrl,
        enabled: true,
        priority: 10, // Lowest priority, use only if others fail
        timeout: 60000,
      };

      const ollamaProvider = new OllamaProvider(ollamaConfig);

      // Check if Ollama is available
      const isAvailable = await ollamaProvider.isAvailable();
      if (isAvailable) {
        providerManager.registerProvider(ollamaConfig, ollamaProvider);
        logger.info('✅ Ollama provider registered (local models available)');
      } else {
        logger.warn('⚠️  Ollama not available at ' + ollamaUrl);
      }
    } catch (error) {
      logger.warn('⚠️  Ollama provider initialization failed');
    }

    // Initialize core
    await core.initialize();

    logger.info('🎉 Nova Core initialized successfully!');
    return core;
  }
}
