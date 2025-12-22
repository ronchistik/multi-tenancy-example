/**
 * Flights route
 */

import type { FastifyPluginCallback } from 'fastify';
import { FlightsService } from '../../domain/flights/flights.service.js';
import { flightSearchSchema } from '../schemas/flights.schema.js';
import { VerticalDisabledError } from '../../shared/errors.js';
import { isTenantVerticalEnabled } from '../../platform/tenant/tenant.registry.js';

export const flightsRoute: FastifyPluginCallback = (fastify, opts, done) => {
  const flightsService = new FlightsService();

  fastify.post('/flights/search', async (request, reply) => {
    const context = request.tenantContext;

    // Check if flights vertical is enabled
    if (!isTenantVerticalEnabled(context.tenant, 'flights')) {
      throw new VerticalDisabledError('flights', context.tenant.id);
    }

    // Validate request
    const searchParams = flightSearchSchema.parse(request.body);

    // Search
    const result = await flightsService.searchFlights(searchParams, context);

    return result;
  });

  done();
};

