import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { bookingsRoutes } from './modules/bookings/bookings.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import { registerDolphinRoutes } from './modules/integration/index.js';

const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    ...(env.LOG_PRETTY && env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // JWT
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIMEWINDOW,
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Termburg API',
        description: 'REST API for Termburg spa website',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${env.HOST}:${env.PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(bookingsRoutes, { prefix: '/api/bookings' });
  await fastify.register(paymentsRoutes, { prefix: '/api/payments' });

  // Integration routes (1C-Дельфін)
  await registerDolphinRoutes(fastify);

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method}:${request.url} not found`,
      },
    });
  });
}

// Error handler
fastify.setErrorHandler(errorHandler);

// Start server
async function start() {
  try {
    // Connect to database
    await connectDatabase();

    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    // Start listening
    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`
╔═══════════════════════════════════════╗
║   Termburg API Server Started         ║
╚═══════════════════════════════════════╝

🚀 Server running on: http://${env.HOST}:${env.PORT}
📚 API Documentation: http://${env.HOST}:${env.PORT}/docs
🌍 Environment: ${env.NODE_ENV}
💾 Database: Connected
⚡ Rate limit: ${env.RATE_LIMIT_MAX} requests per ${env.RATE_LIMIT_TIMEWINDOW}ms

Press CTRL+C to stop
    `);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await fastify.close();
    await disconnectDatabase();
    console.log('✅ Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
start();
