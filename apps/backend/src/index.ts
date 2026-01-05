/**
 * API entry point
 */

import { createServer } from './server.js';
import { env } from './shared/env.js';
import { logger } from './shared/logger.js';

async function main() {
  try {
    const server = await createServer();

    const host = env.API_HOST;
    const port = parseInt(env.API_PORT, 10);

    await server.listen({ host, port });

    logger.info(`🚀 API server running at http://${host}:${port}`);
    logger.info(`📊 Health check: http://${host}:${port}/health`);
    logger.info(`📖 API prefix: http://${host}:${port}/api`);
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

main();

