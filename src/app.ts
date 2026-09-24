import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { Pool } from 'pg';
import { registerFederationRoutes } from './api/federation';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  // Documentation-only keys used in route schemas (OpenAPI generation is planned).
  interface FastifySchema {
    description?: string;
    tags?: string[];
  }
}

interface AppConfig {
  port: number;
  host: string;
  env: 'development' | 'production' | 'test';
  databaseUrl: string;
  instanceId: string;
  jwtSecret: string;
}

const APP_VERSION = '0.1.0';

const getConfig = (): AppConfig => {
  const env = (process.env.NODE_ENV as AppConfig['env']) || 'development';

  if (env === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production');
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    env,
    databaseUrl:
      process.env.DATABASE_URL || 'postgresql://darivs:changeme@localhost:5432/darivs',
    instanceId: process.env.INSTANCE_ID || 'default-instance',
    // Development-only fallback; production requires JWT_SECRET (checked above).
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  };
};

let db: Pool | null = null;

export const getDb = (): Pool => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const createApp = async (): Promise<FastifyInstance> => {
  const config = getConfig();

  const app = Fastify({
    logger: config.env !== 'test',
  });

  // The pool connects lazily: no connection is opened until the first query.
  db = new Pool({ connectionString: config.databaseUrl });
  app.log.info('Database pool created');

  app.addHook('onClose', async () => {
    if (db) {
      await db.end();
      db = null;
    }
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(jwt, {
    secret: config.jwtSecret,
  });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  app.get('/health', async () => {
    return {
      status: 'ok',
      instance: config.instanceId,
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/api/v1/version', async () => {
    return {
      version: APP_VERSION,
      environment: config.env,
      instance: config.instanceId,
    };
  });

  app.get('/', async () => {
    return {
      name: 'DARIVS Fediversity',
      description: 'Pre-grant proof of concept: self-hosted charitable platform with federation',
      version: APP_VERSION,
    };
  });

  await registerFederationRoutes(app);

  return app;
};

const start = async (): Promise<void> => {
  const config = getConfig();
  const app = await createApp();

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    app.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

if (require.main === module) {
  void start();
}
