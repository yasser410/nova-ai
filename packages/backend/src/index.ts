import { app, novaCore, initializeProviders, logger } from './app';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize providers
    await initializeProviders();

    // Initialize Nova Core
    await novaCore.initialize();

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Nova Backend Server running on http://localhost:${PORT}`);
      logger.info(`Developer: الحاج ياسر`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

startServer();
