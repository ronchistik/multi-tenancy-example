/**
 * Page Config API Routes
 * 
 * CRUD operations for page configurations and theme overrides.
 * Tenant-aware: uses X-Tenant-Id header for multi-tenancy.
 */

import type { FastifyPluginCallback } from 'fastify';
import * as configStore from '../../database/configStore.js';

export const pageConfigRoute: FastifyPluginCallback = (fastify, opts, done) => {
  
  // =========================================================================
  // Page Configs
  // =========================================================================
  
  /**
   * GET /page-config/:pageId
   */
  fastify.get('/page-config/:pageId', {
    schema: {
      description: 'Get page configuration for the current tenant',
      tags: ['Page Config'],
      params: {
        type: 'object',
        properties: {
          pageId: { type: 'string', description: 'Page identifier (e.g., flights-page)' }
        },
        required: ['pageId']
      },
      headers: {
        type: 'object',
        required: ['x-tenant-id'],
        properties: {
          'x-tenant-id': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            tenantId: { type: 'string' },
            pageId: { type: 'string' },
            serializedState: { type: 'object', additionalProperties: true },
            updatedAt: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, (request, reply) => {
    const { pageId } = request.params as { pageId: string };
    const tenantId = request.tenantContext.tenant.id;
    
    const config = configStore.getPageConfig(tenantId, pageId);
    
    if (!config) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `No config found for page: ${pageId}`
      });
    }
    
    return {
      tenantId: config.tenant_id,
      pageId: config.page_id,
      serializedState: JSON.parse(config.serialized_state),
      updatedAt: config.updated_at
    };
  });
  
  /**
   * PUT /page-config/:pageId
   */
  fastify.put('/page-config/:pageId', {
    schema: {
      description: 'Save page configuration for the current tenant',
      tags: ['Page Config'],
      params: {
        type: 'object',
        properties: {
          pageId: { type: 'string' }
        },
        required: ['pageId']
      },
      headers: {
        type: 'object',
        required: ['x-tenant-id'],
        properties: {
          'x-tenant-id': { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['serializedState'],
        properties: {
          serializedState: { type: 'object', additionalProperties: true }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            tenantId: { type: 'string' },
            pageId: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }, (request) => {
    const { pageId } = request.params as { pageId: string };
    const { serializedState } = request.body as { serializedState: Record<string, unknown> };
    const tenantId = request.tenantContext.tenant.id;
    
    const config = configStore.savePageConfig(tenantId, pageId, serializedState);
    
    return {
      success: true,
      tenantId: config.tenant_id,
      pageId: config.page_id,
      updatedAt: config.updated_at
    };
  });
  
  /**
   * DELETE /page-config/:pageId
   */
  fastify.delete('/page-config/:pageId', {
    schema: {
      description: 'Delete page configuration for the current tenant',
      tags: ['Page Config'],
      params: {
        type: 'object',
        properties: {
          pageId: { type: 'string' }
        },
        required: ['pageId']
      },
      headers: {
        type: 'object',
        required: ['x-tenant-id'],
        properties: {
          'x-tenant-id': { type: 'string' }
        }
      }
    }
  }, (request) => {
    const { pageId } = request.params as { pageId: string };
    const tenantId = request.tenantContext.tenant.id;
    
    const deleted = configStore.deletePageConfig(tenantId, pageId);
    
    return { success: deleted };
  });
  
  // =========================================================================
  // Theme Overrides
  // =========================================================================
  
  /**
   * GET /theme
   */
  fastify.get('/theme', {
    schema: {
      description: 'Get theme overrides for the current tenant',
      tags: ['Theme'],
      headers: {
        type: 'object',
        required: ['x-tenant-id'],
        properties: {
          'x-tenant-id': { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            tenantId: { type: 'string' },
            themeOverrides: { type: 'object', additionalProperties: true },
            updatedAt: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, (request, reply) => {
    const tenantId = request.tenantContext.tenant.id;
    
    const theme = configStore.getTenantTheme(tenantId);
    
    if (!theme) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'No theme overrides found'
      });
    }
    
    return {
      tenantId: theme.tenant_id,
      themeOverrides: JSON.parse(theme.theme_overrides),
      updatedAt: theme.updated_at
    };
  });
  
  /**
   * PUT /theme
   */
  fastify.put('/theme', {
    schema: {
      description: 'Save theme overrides for the current tenant',
      tags: ['Theme'],
      headers: {
        type: 'object',
        required: ['x-tenant-id'],
        properties: {
          'x-tenant-id': { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['themeOverrides'],
        properties: {
          themeOverrides: { type: 'object', additionalProperties: true }
        }
      }
    }
  }, (request) => {
    const { themeOverrides } = request.body as { themeOverrides: Record<string, unknown> };
    const tenantId = request.tenantContext.tenant.id;
    
    const theme = configStore.saveTenantTheme(tenantId, themeOverrides);
    
    return {
      success: true,
      tenantId: theme.tenant_id,
      updatedAt: theme.updated_at
    };
  });
  
  /**
   * DELETE /theme
   */
  fastify.delete('/theme', {
    schema: {
      description: 'Reset theme to defaults for the current tenant',
      tags: ['Theme'],
      headers: {
        type: 'object',
        required: ['x-tenant-id'],
        properties: {
          'x-tenant-id': { type: 'string' }
        }
      }
    }
  }, (request) => {
    const tenantId = request.tenantContext.tenant.id;
    
    const deleted = configStore.deleteTenantTheme(tenantId);
    
    return { success: deleted };
  });
  
  // =========================================================================
  // Reset Operations
  // =========================================================================
  
  /**
   * POST /reset
   */
  fastify.post('/reset', {
    schema: {
      description: 'Reset all page configs and theme for the current tenant',
      tags: ['Reset'],
      headers: {
        type: 'object',
        required: ['x-tenant-id'],
        properties: {
          'x-tenant-id': { type: 'string' }
        }
      }
    }
  }, (request) => {
    const tenantId = request.tenantContext.tenant.id;
    
    configStore.resetTenant(tenantId);
    
    return { success: true, message: `All configs reset for tenant: ${tenantId}` };
  });
  
  /**
   * POST /reset-all
   */
  fastify.post('/reset-all', {
    schema: {
      description: 'Reset all page configs and themes for ALL tenants',
      tags: ['Reset']
    }
  }, () => {
    configStore.resetAll();
    
    return { success: true, message: 'All configs reset for all tenants' };
  });
  
  done();
};
