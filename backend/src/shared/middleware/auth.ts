import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../types/index.js';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();

    if (!request.user) {
      throw new UnauthorizedError('Invalid token');
    }
  } catch (error) {
    throw new UnauthorizedError('Authentication required');
  }
}

export function authorize(...allowedRoles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(authRequest.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}

// Alias for authorize
export const requireRole = authorize;
