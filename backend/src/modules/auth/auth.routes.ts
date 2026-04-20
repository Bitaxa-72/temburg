import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from './auth.schema.js';
import { validateBody } from '../../shared/middleware/validation.js';
import { authenticate } from '../../shared/middleware/auth.js';
import type { AuthenticatedRequest } from '../../shared/types/index.js';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify);

  // Register
  fastify.post(
    '/register',
    {
      preHandler: [validateBody(registerSchema)],
      schema: {
        tags: ['Authentication'],
        description: 'Register a new user',
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 2 },
            phone: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: { type: 'object' },
                  token: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const result = await authService.register(request.body as any);
      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  // Login
  fastify.post(
    '/login',
    {
      preHandler: [validateBody(loginSchema)],
      schema: {
        tags: ['Authentication'],
        description: 'Login user',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: { type: 'object' },
                  token: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const result = await authService.login(request.body as any);
      return reply.send({
        success: true,
        data: result,
      });
    }
  );

  // Get profile
  fastify.get(
    '/profile',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Authentication'],
        description: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const user = await authService.getProfile(request.user.id);
      return reply.send({
        success: true,
        data: user,
      });
    }
  );

  // Update profile
  fastify.patch(
    '/profile',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Authentication'],
        description: 'Update user profile',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
            },
          },
        },
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const user = await authService.updateProfile(
        request.user.id,
        request.body as any
      );
      return reply.send({
        success: true,
        data: user,
      });
    }
  );

  // Change password
  fastify.post(
    '/change-password',
    {
      preHandler: [authenticate, validateBody(changePasswordSchema)],
      schema: {
        tags: ['Authentication'],
        description: 'Change user password',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const { currentPassword, newPassword } = request.body as any;
      const result = await authService.changePassword(
        request.user.id,
        currentPassword,
        newPassword
      );
      return reply.send({
        success: true,
        data: result,
      });
    }
  );
}
