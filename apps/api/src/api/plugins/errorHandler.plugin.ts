/**
 * Global error handler plugin
 */

import type { FastifyPluginCallback, FastifyError } from 'fastify';
import { AppError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import { ZodError } from 'zod';

export const errorHandlerPlugin: FastifyPluginCallback = (fastify, opts, done) => {
  fastify.setErrorHandler((error: FastifyError | Error, request, reply) => {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      logger.warn('Validation error', { errors: error.errors });
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.errors,
      });
    }

    // Handle application errors
    if (error instanceof AppError) {
      logger.warn('Application error', { error: error.message, code: error.code });
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
        code: error.code,
      });
    }

    // Handle unexpected errors
    logger.error('Unexpected error', { error: error.message, stack: error.stack });
    
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });

  done();
};

