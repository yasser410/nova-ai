import pino from 'pino';
import { LogLevel, LogEntry } from '@nova/types';

class NovaLogger {
  private logger: pino.Logger;

  constructor(name: string = 'Nova') {
    this.logger = pino({
      name,
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  debug(message: string, context?: Record<string, any>) {
    this.logger.debug(context || {}, message);
  }

  info(message: string, context?: Record<string, any>) {
    this.logger.info(context || {}, message);
  }

  warn(message: string, context?: Record<string, any>) {
    this.logger.warn(context || {}, message);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.logger.error(
      {
        error: error?.message,
        stack: error?.stack,
        ...context,
      },
      message
    );
  }

  createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };
  }
}

export { NovaLogger };
