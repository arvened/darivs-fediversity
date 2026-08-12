import Fastify, { FastifyInstance } from 'fastify';
import cors from 'fastify-cors';
import helmet from 'fastify-helmet';
import jwt from 'fastify-jwt';
import { Pool } from 'pg';

interface AppConfig {
  port: number;
  host: string;
  env: 'development' | 'production' | 'test';
  databaseUrl: string;
  redisUrl: string;
  instanceId: string;
  jwtSecret: string;
}

const getConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  env: (process.env.NODE_ENV as AppConfig['env']) || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://darivs:changeme@localhost:5432/darivs',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  instanceId: process.env.INSTANCE_ID || 'default-instance',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
});

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

  try {
    db = new Pool({
      connectionString: config.databaseUrl,
    });
    app.log.info('Database pool created');
  } catch (error) {
    app.log.error('Failed to create database pool:', error);
    throw error;
  }

  await app.register(helmet);
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(jwt, {
    secret: config.jwtSecret,
  });

  app.get('/health', async () => {
    return {
      status: 'ok',
      instance: config.instanceId,
      timestamp: new Date().
