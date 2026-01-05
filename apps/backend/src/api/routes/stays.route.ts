/**
 * Stays route
 */

import type { FastifyPluginCallback } from 'fastify';
import { StaysService } from '../../domain/stays/stays.service.js';
import { staySearchSchema } from '../schemas/stays.schema.js';
import { VerticalDisabledError } from '../../shared/errors.js';
import { isTenantVerticalEnabled } from '../../platform/tenant/tenant.registry.js';

// Compute future dates for Swagger defaults
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

const defaultCheckInDate = getFutureDate(7);   // 1 week from now
const defaultCheckOutDate = getFutureDate(10); // 10 days from now

export const staysRoute: FastifyPluginCallback = (fastify, opts, done) => {
  const staysService = new StaysService();

  fastify.post('/stays/search', {
    schema: {
      description: 'Search for hotels/accommodations using Duffel Stays API. Tenant-specific defaults are applied.',
      tags: ['Stays'],
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
        required: ['locationId', 'checkInDate', 'checkOutDate', 'guests', 'rooms'],
        properties: {
          locationId: { type: 'string', description: 'Location ID from /config endpoint', default: 'nyc' },
          checkInDate: { type: 'string', format: 'date', description: 'Check-in date (YYYY-MM-DD)', default: defaultCheckInDate },
          checkOutDate: { type: 'string', format: 'date', description: 'Check-out date (YYYY-MM-DD)', default: defaultCheckOutDate },
          guests: { type: 'integer', minimum: 1, description: 'Number of guests', default: 2 },
          rooms: { type: 'integer', minimum: 1, description: 'Number of rooms', default: 1 },
        },
      },
      response: {
        200: {
          description: 'Stay search results with policy evaluation',
          type: 'object',
          additionalProperties: true,
          properties: {
            stays: { 
              type: 'array', 
              items: { 
                type: 'object',
                additionalProperties: true,
                properties: {
                  id: { type: 'string' },
                  accommodation: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                      name: { type: 'string' },
                      rating: { type: 'integer' },
                      location: {
                        type: 'object',
                        additionalProperties: true,
                        properties: {
                          address: { type: 'string' },
                          city: { type: 'string' },
                        }
                      },
                      photos: { type: 'array', items: { type: 'string' } },
                    }
                  },
                  rates: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: true,
                      properties: {
                        id: { type: 'string' },
                        price: {
                          type: 'object',
                          properties: {
                            amount: { type: 'string' },
                            currency: { type: 'string' },
                          }
                        },
                        roomName: { type: 'string' },
                      }
                    }
                  },
                  policy: {
                    type: 'object',
                    additionalProperties: true,
                    properties: {
                      compliant: { type: 'boolean' },
                      violations: { 
                        type: 'array', 
                        items: { 
                          type: 'object',
                          additionalProperties: true,
                          properties: {
                            type: { type: 'string' },
                            message: { type: 'string' },
                            severity: { type: 'string' },
                          }
                        } 
                      },
                    }
                  },
                }
              } 
            },
            metadata: { 
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
    },
  }, async (request, _reply) => {
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

