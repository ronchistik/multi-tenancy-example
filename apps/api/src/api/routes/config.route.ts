/**
 * Config route - returns public tenant configuration
 */

import type { FastifyPluginCallback } from 'fastify';
import { toPublicTenantConfig } from '../../platform/tenant/tenant.public.js';
import { getAllLocations } from '../../platform/locations/locations.js';

export const configRoute: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.get('/config', {
    schema: {
      description: 'Get tenant configuration including enabled verticals, search defaults, and UX hints',
      tags: ['Config'],
      headers: {
        type: 'object',
        required: ['x-tenant-id'],
        properties: {
          'x-tenant-id': {
            type: 'string',
            description: 'Tenant identifier',
            enum: ['saver-trips', 'apex-reserve', 'globex-systems'],
          },
        },
      },
      response: {
        200: {
          description: 'Tenant configuration and available locations',
          type: 'object',
          additionalProperties: true,
          properties: {
            tenant: {
              type: 'object',
              additionalProperties: true,
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                enabledVerticals: { type: 'array', items: { type: 'string' } },
                flightDefaults: { type: 'object', additionalProperties: true },
                stayDefaults: { type: 'object', additionalProperties: true },
                uxHints: { type: 'object', additionalProperties: true },
                pages: { type: 'object', additionalProperties: true },
              },
            },
            locations: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: true,
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  lat: { type: 'number' },
                  lon: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    if (!request.tenantContext) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Tenant context not initialized',
      });
    }

    const { tenant } = request.tenantContext;

    // Return public tenant config + available locations
    return {
      tenant: toPublicTenantConfig(tenant),
      locations: getAllLocations(),
    };
  });

  done();
};

