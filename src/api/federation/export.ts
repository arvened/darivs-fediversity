import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import FederationProtocol from '../../federation/protocol';
import { getDb } from '../../app';

/**
 * Export API Routes
 * Handles data export for federation/GDPR compliance
 */
export async function registerExportRoutes(app: FastifyInstance): Promise<void> {
  const db = getDb();

  /**
   * GET /federation/export/users
   * Export all user data (GDPR compliance)
   * Requires authentication
   */
  app.get(
    '/federation/export/users',
    {
      onRequest: [app.authenticate],
      schema: {
        description: 'Export all user data for GDPR compliance',
        tags: ['federation'],
        response: {
          200: {
            description: 'Data package exported',
            type: 'object',
          },
        },
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const instanceId = process.env.INSTANCE_ID || 'default-instance';
        const protocol = new FederationProtocol(
          instanceId,
          process.env.PRIVATE_KEY || 'default-private-key',
          process.env.PUBLIC_KEY || 'default-public-key'
        );

        // Fetch all user data
        const usersResult = await db.query(
          'SELECT id, username, email, jurisdiction, created_at, updated_at FROM users'
        );
        const users = usersResult.rows;

        // Fetch user transactions
        const transactionsResult = await db.query(
          'SELECT id, user_id, amount, charity_allocation, platform_fee, jurisdiction, status, created_at FROM transactions'
        );
        const transactions = transactionsResult.rows;

        // Fetch charities
        const charitiesResult = await db.query(
          'SELECT id, name, jurisdiction, verified, created_at FROM charities'
        );
        const charities = charitiesResult.rows;

        // Fetch challenges
        const challengesResult = await db.query(
          'SELECT id, creator_id, title, category, status, created_at FROM challenges'
        );
        const challenges = challengesResult.rows;

        // Fetch predictions
        const predictionsResult = await db.query(
          'SELECT id, user_id, challenge_id, prediction_value, amount, status, created_at FROM predictions'
        );
        const predictions = predictionsResult.rows;

        // Create data package
        const pkg = protocol.createDataPackage(
          users,
          transactions,
          charities,
          challenges,
          predictions
        );

        // Log export
        await db.query(
          'INSERT INTO data_exports (instance_id, checksum, data_size, status) VALUES ($1, $2, $3, $4)',
          [
            instanceId,
            pkg.checksum,
            JSON.stringify(pkg).length,
            'completed',
          ]
        );

        reply.code(200).send(pkg);
      } catch (error) {
        app.log.error({ err: error }, 'Export failed');
        reply.code(500).send({
          success: false,
          error: 'Export failed',
        });
      }
    }
  );

  /**
   * GET /federation/export/transactions
   * Export immutable transaction log
   * Signed with hash-chain
   */
  app.get(
    '/federation/export/transactions',
    {
      onRequest: [app.authenticate],
      schema: {
        description: 'Export immutable transaction log',
        tags: ['federation'],
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Fetch audit log
        const auditResult = await db.query(
          'SELECT * FROM compliance_audit_log ORDER BY timestamp ASC'
        );
        const auditLog = auditResult.rows;

        // Fetch hash chain
        const hashResult = await db.query(
          'SELECT * FROM hash_chain ORDER BY created_at ASC'
        );
        const hashChain = hashResult.rows;

        reply.code(200).send({
          success: true,
          auditLog,
          hashChain,
          totalRecords: auditLog.length,
        });
      } catch (error) {
        app.log.error({ err: error }, 'Transaction export failed');
        reply.code(500).send({
          success: false,
          error: 'Transaction export failed',
        });
      }
    }
  );

  /**
   * GET /federation/export/meta
   * Get export metadata and statistics
   */
  app.get(
    '/federation/export/meta',
    {
      onRequest: [app.authenticate],
      schema: {
        description: 'Get export metadata',
        tags: ['federation'],
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const usersResult = await db.query('SELECT COUNT(*) FROM users');
        const transactionsResult = await db.query(
          'SELECT COUNT(*) FROM transactions'
        );
        const charitiesResult = await db.query(
          'SELECT COUNT(*) FROM charities'
        );

        const userCount = parseInt(usersResult.rows[0].count, 10);
        const transactionCount = parseInt(transactionsResult.rows[0].count, 10);
        const charityCount = parseInt(charitiesResult.rows[0].count, 10);

        reply.code(200).send({
          success: true,
          instanceId: process.env.INSTANCE_ID || 'default-instance',
          exportedAt: new Date().toISOString(),
          statistics: {
            users: userCount,
            transactions: transactionCount,
            charities: charityCount,
          },
        });
      } catch (error) {
        app.log.error({ err: error }, 'Metadata export failed');
        reply.code(500).send({
          success: false,
          error: 'Metadata export failed',
        });
      }
    }
  );
}

export default registerExportRoutes;
