import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../utils/errors.js';
import { env } from '../../config/env.js';
import { ZodError } from 'zod';

export async function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Log error
  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    url: request.url,
    method: request.method,
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(422).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      },
    });
  }

  // Custom application errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(env.NODE_ENV === 'development' && error.details ? { details: error.details } : {}),
      },
    });
  }

  // Fastify validation errors
  if ('validation' in error && error.validation) {
    return reply.status(422).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.validation,
      },
    });
  }

  // JWT errors
  if (error.message.includes('jwt') || error.message.includes('token')) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }

  // Default error response
  const statusCode = 'statusCode' in error ? error.statusCode : 500;
  reply.status(statusCode || 500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
      ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    },
  });
}
