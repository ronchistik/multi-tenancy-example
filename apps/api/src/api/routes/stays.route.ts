/**
 * Stays route
 */

import type { FastifyPluginCallback } from 'fastify';
import { StaysService } from '../../domain/stays/stays.service.js';
import { staySearchSchema } from '../schemas/stays.schema.js';
import { VerticalDisabledError } from '../../shared/errors.js';
import { isTenantVerticalEnabled } from '../../platform/tenant/tenant.registry.js';

export const staysRoute: FastifyPluginCallback = (fastify, opts, done) => {
  const staysService = new StaysService();

  fastify.post('/stays/search', async (request, reply) => {
    const context = request.tenantContext;

    // Check if stays vertical is enabled
    if (!isTenantVerticalEnabled(context.tenant, 'stays')) {
      throw new VerticalDisabledError('stays', context.tenant.id);
    }

    // Validate request
    const searchParams = staySearchSchema.parse(request.body);

    // Search
    const result = await staysService.searchStays(searchParams, context);

    return result;
  });

  done();
};

