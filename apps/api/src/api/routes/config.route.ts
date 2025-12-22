/**
 * Config route - returns public tenant configuration
 */

import type { FastifyPluginCallback } from 'fastify';
import { toPublicTenantConfig } from '../../platform/tenant/tenant.public.js';
import { getAllLocations } from '../../platform/locations/locations.js';

export const configRoute: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.get('/config', async (request, reply) => {
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

