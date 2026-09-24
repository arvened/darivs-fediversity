/**
 * Federation API Module
 * Exports all federation API routes
 */

import { FastifyInstance } from 'fastify';
import { registerExportRoutes } from './export';
import { registerImportRoutes } from './import';

/**
 * Register all federation routes
 */
export async function registerFederationRoutes(app: FastifyInstance): Promise<void> {
  // Register export routes
  await registerExportRoutes(app);

  // Register import routes
  await registerImportRoutes(app);

  // Federation status endpoint
  app.get(
    '/federation/status',
    {
      schema: {
        description: 'Get federation instance status',
        tags: ['federation'],
      },
    },
    async () => {
      return {
        status: 'ok',
        instance: process.env.INSTANCE_ID || 'default-instance',
        version: '0.1.0',
        federation: {
          enabled: process.env.FEDERATION_ENABLED === 'true',
          protocol: '1.0',
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // Federation instances list endpoint
  app.get(
    '/federation/instances',
    {
      schema: {
        description: 'List known federation instances',
        tags: ['federation'],
      },
    },
    async () => {
      // This would be populated from registry in production
      return {
        success: true,
        instances: [],
        timestamp: new Date().toISOString(),
      };
    }
  );

  app.log.info('Federation routes registered');
}

export { registerExportRoutes, registerImportRoutes };
export default registerFederationRoutes;
