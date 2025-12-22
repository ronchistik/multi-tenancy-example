/**
 * Tenant context plugin
 * Resolves tenant from X-Tenant-Id header and attaches to request
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { getTenant } from '../../platform/tenant/tenant.registry.js';
import { TenantNotFoundError } from '../../shared/errors.js';
import type { TenantContext } from '../../platform/tenant/tenant.types.js';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    tenantContext: TenantContext;
  }
}

async function tenantContext(fastify: any, opts: any) {
  fastify.decorateRequest('tenantContext', null);

  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Get tenant ID from header
    const tenantId = request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Missing X-Tenant-Id header',
      });
    }

    // Resolve tenant
    const tenant = getTenant(tenantId as any);

    if (!tenant) {
      throw new TenantNotFoundError(tenantId);
    }

    // Attach context to request
    request.tenantContext = {
      tenant,
      requestId: randomUUID(),
    };
  });
}

export const tenantContextPlugin = fp(tenantContext, {
  name: 'tenant-context',
  fastify: '5.x',
});

