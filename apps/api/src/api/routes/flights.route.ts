/**
 * Flights route
 */

import type { FastifyPluginCallback } from 'fastify';
import { FlightsService } from '../../domain/flights/flights.service.js';
import { flightSearchSchema } from '../schemas/flights.schema.js';
import { VerticalDisabledError } from '../../shared/errors.js';
import { isTenantVerticalEnabled } from '../../platform/tenant/tenant.registry.js';

// Compute future dates for Swagger defaults
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

const defaultDepartureDate = getFutureDate(7);  // 1 week from now
const defaultReturnDate = getFutureDate(14);     // 2 weeks from now

export const flightsRoute: FastifyPluginCallback = (fastify, opts, done) => {
  const flightsService = new FlightsService();

  fastify.post('/flights/search', {
    schema: {
      description: 'Search for flights using Duffel API. Tenant-specific defaults are applied.',
      tags: ['Flights'],
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
      body: {
        type: 'object',
        required: ['origin', 'destination', 'departureDate', 'passengers'],
        properties: {
          origin: { type: 'string', description: 'Origin airport IATA code', default: 'JFK', minLength: 3, maxLength: 3 },
          destination: { type: 'string', description: 'Destination airport IATA code', default: 'LAX', minLength: 3, maxLength: 3 },
          departureDate: { type: 'string', format: 'date', description: 'Departure date (YYYY-MM-DD)', default: defaultDepartureDate },
          returnDate: { type: 'string', format: 'date', description: 'Return date (optional)', default: defaultReturnDate },
          passengers: { type: 'integer', minimum: 1, maximum: 9, description: 'Number of passengers', default: 1 },
          cabinClass: { type: 'string', enum: ['economy', 'premium_economy', 'business', 'first'], description: 'Cabin class (uses tenant default if omitted)', default: 'economy' },
        },
      },
      response: {
        200: {
          description: 'Flight search results with policy evaluation',
          type: 'object',
          additionalProperties: true,
          properties: {
            requestId: { type: 'string', description: 'Duffel request ID' },
            offers: { 
              type: 'array', 
              items: { 
                type: 'object',
                additionalProperties: true,
                properties: {
                  id: { type: 'string' },
                  owner: { 
                    type: 'object',
                    properties: {
                      code: { type: 'string', description: 'Airline IATA code' },
                      name: { type: 'string', description: 'Airline name' },
                    }
                  },
                  price: {
                    type: 'object',
                    properties: {
                      amount: { type: 'string' },
                      currency: { type: 'string' },
                    }
                  },
                  policy: {
                    type: 'object',
                    properties: {
                      compliant: { type: 'boolean' },
                      preferred: { type: 'boolean' },
                      violations: { type: 'array', items: { type: 'object' } },
                      promotions: { type: 'array', items: { type: 'object' } },
                    }
                  },
                }
              } 
            },
            metadata: { 
              type: 'object',
              additionalProperties: true,
              properties: {
                searchParams: { type: 'object' },
                appliedDefaults: { type: 'object' },
              }
            },
          },
        },
      },
    },
  }, async (request, reply) => {
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

