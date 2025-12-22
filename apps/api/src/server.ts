/**
 * Fastify server setup
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { tenantContextPlugin } from './api/plugins/tenantContext.plugin.js';
import { errorHandlerPlugin } from './api/plugins/errorHandler.plugin.js';
import { configRoute } from './api/routes/config.route.js';
import { flightsRoute } from './api/routes/flights.route.js';
import { staysRoute } from './api/routes/stays.route.js';
import { logger } from './shared/logger.js';

export async function createServer() {
  const fastify = Fastify({
    logger: false, // Use custom logger
  });

  // Register CORS
  await fastify.register(cors, {
    origin: true, // Allow all origins in dev (restrict in production)
    credentials: true,
  });

  // Register error handler
  await fastify.register(errorHandlerPlugin);

  // Health check (no tenant required)
  fastify.get('/health', async () => ({ status: 'ok' }));

  // Register tenant-aware routes
  await fastify.register(async (instance) => {
    // Tenant context middleware
    await instance.register(tenantContextPlugin);

    // API routes
    await instance.register(configRoute, { prefix: '/api' });
    await instance.register(flightsRoute, { prefix: '/api' });
    await instance.register(staysRoute, { prefix: '/api' });
  });

  return fastify;
}

