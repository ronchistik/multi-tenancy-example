/**
 * Fastify server setup
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { tenantContextPlugin } from './api/plugins/tenantContext.plugin.js';
import { configRoute } from './api/routes/config.route.js';
import { flightsRoute } from './api/routes/flights.route.js';
import { staysRoute } from './api/routes/stays.route.js';
import { pageConfigRoute } from './api/routes/pageConfig.route.js';
import { initSchema, closeDb } from './database/db.js';
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

  // Register Swagger (OpenAPI) documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Odynn Multi-Tenant Travel Platform API',
        description: 'A multi-tenant travel search platform supporting flights and hotel search with tenant-specific configurations, policies, and UX customization.',
        version: '1.0.0',
      },
      servers: [
        { url: 'http://localhost:5050', description: 'Local development server' },
      ],
      tags: [
        { name: 'Config', description: 'Tenant configuration endpoints' },
        { name: 'Flights', description: 'Flight search operations' },
        { name: 'Stays', description: 'Hotel/accommodation search operations' },
        { name: 'Page Config', description: 'Page layout configuration (stored in SQLite)' },
        { name: 'Theme', description: 'Tenant theme overrides (stored in SQLite)' },
        { name: 'Reset', description: 'Reset operations' },
      ],
      components: {
        securitySchemes: {
          tenantId: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Tenant-Id',
            description: 'Tenant identifier (saver-trips, apex-reserve, globex-systems)',
          },
        },
      },
    },
  });

  // Register Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Global error handler (inline, not plugin)
  fastify.setErrorHandler(async (error, request, reply) => {
    const tenantId = request.tenantContext?.tenant?.id;
    logger.info('ERROR HANDLER CALLED', { error: error.message, tenantId });
    
    // Persist to DB
    const { logError } = await import('./database/configStore.js');
    try {
      logError({
        tenantId,
        requestId: request.id,
        errorCode: (error as any).code || 'UNKNOWN',
        errorMessage: error.message,
        httpStatus: (error as any).statusCode || 500,
        requestMethod: request.method,
        requestPath: request.url,
        stackTrace: error.stack,
      });
    } catch (e) {
      logger.error('Failed to log error to DB', { error: (e as Error).message });
    }
    
    // Send response
    const statusCode = (error as any).statusCode || 500;
    return reply.status(statusCode).send({
      statusCode,
      error: error.name,
      message: error.message,
      code: (error as any).code,
    });
  });

  // Initialize SQLite database (auto-creates data/configs.db)
  initSchema();

  // Health check (no tenant required)
  fastify.get('/health', async () => ({ status: 'ok' }));

  // Reset-all endpoint (no tenant required)
  fastify.post('/api/reset-all', {
    schema: {
      description: 'Reset all page configs and themes for ALL tenants',
      tags: ['Reset']
    }
  }, async () => {
    const { resetAll } = await import('./database/configStore.js');
    resetAll();
    return { success: true, message: 'All configs reset for all tenants' };
  });

  // Global request logging (at root level to catch all requests)
  fastify.addHook('onRequest', (request, reply, done) => {
    (request as any).startTime = Date.now();
    done();
  });
  
  fastify.addHook('onResponse', (request, reply, done) => {
    // Skip OPTIONS (CORS preflight) - they don't have tenant context
    if (request.method === 'OPTIONS') {
      done();
      return;
    }
    
    const tenantId = request.tenantContext?.tenant?.id;
    const durationMs = Date.now() - ((request as any).startTime || Date.now());
    
    // Log all tenant-aware API requests
    if (request.url.startsWith('/api/') && !request.url.includes('/docs')) {
      logger.info(`${request.method} ${request.url} ${reply.statusCode} ${durationMs}ms`, {
        tenantId,
        requestId: request.id,
      });
    }
    done();
  });

  // Register tenant-aware routes
  await fastify.register(async (instance) => {
    // Tenant context middleware
    await instance.register(tenantContextPlugin);

    // API routes
    await instance.register(configRoute, { prefix: '/api' });
    await instance.register(flightsRoute, { prefix: '/api' });
    await instance.register(staysRoute, { prefix: '/api' });
    await instance.register(pageConfigRoute, { prefix: '/api' });
  });

  // Graceful shutdown
  fastify.addHook('onClose', () => {
    closeDb();
  });

  return fastify;
}

