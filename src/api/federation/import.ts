import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DataPackage } from '../../federation/protocol';
import FederationProtocol from '../../federation/protocol';
import { getDb } from '../../app';

export interface ImportRequestBody {
  dataPackage: DataPackage;
  remotePublicKey: string;
  overwriteConflicts?: boolean;
}

export interface ImportResponse {
  success: boolean;
  totalRecords?: number;
  conflicts?: string[];
  imported?: {
    users: number;
    transactions: number;
    charities: number;
  };
  error?: string;
}

/**
 * Import API Routes
 * Handles data import for federation/service portability
 */
export async function registerImportRoutes(app: FastifyInstance): Promise<void> {
  const db = getDb();

  /**
   * POST /federation/import
   * Import data package from another instance
   * Validates signature, detects conflicts, merges data
   */
  app.post<{ Body: ImportRequestBody; Reply: ImportResponse }>(
    '/federation/import',
    {
      onRequest: [app.authenticate],
      schema: {
        description: 'Import data from another federation instance',
        tags: ['federation'],
        body: {
          type: 'object',
          required: ['dataPackage', 'remotePublicKey'],
          properties: {
            dataPackage: { type: 'object' },
            remotePublicKey: { type: 'string' },
            overwriteConflicts: { type: 'boolean' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ImportRequestBody }>, reply: FastifyReply) => {
      try {
        const { dataPackage, remotePublicKey, overwriteConflicts } = request.body;
        const instanceId = process.env.INSTANCE_ID || 'default-instance';

        // Initialize protocol
        const protocol = new FederationProtocol(
          instanceId,
          process.env.PRIVATE_KEY || 'default-private-key',
          process.env.PUBLIC_KEY || 'default-public-key'
        );

        // Validate package signature and checksum
        const validation = protocol.validatePackage(dataPackage, remotePublicKey);
        if (!validation.valid) {
          return reply.code(400).send({
            success: false,
            error: `Validation failed: ${validation.errors.join(', ')}`,
          });
        }

        // Fetch existing users for conflict detection
        const existingUsersResult = await db.query('SELECT id FROM users');
        const existingUserIds = new Set(existingUsersResult.rows.map((r: any) => r.id));

        // Detect conflicts
        const conflicts: string[] = [];
        for (const user of dataPackage.data.users) {
          if (existingUserIds.has((user as any).id)) {
            conflicts.push(`User conflict: ${(user as any).id}`);
          }
        }

        // If conflicts and not overwriting, reject
        if (conflicts.length > 0 && !overwriteConflicts) {
          return reply.code(409).send({
            success: false,
            conflicts,
            error: 'Import conflicts detected',
          });
        }

        // Begin transaction
        const client = await db.connect();

        try {
          await client.query('BEGIN');

          let usersImported = 0;
          let transactionsImported = 0;
          let charitiesImported = 0;

          // Import users
          for (const user of dataPackage.data.users) {
            const u = user as any;
            try {
              await client.query(
                `INSERT INTO users (id, username, email, jurisdiction, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO UPDATE SET
                   username = $2, email = $3, updated_at = $6`,
                [u.id, u.username, u.email, u.jurisdiction, u.created_at, u.updated_at]
              );
              usersImported++;
            } catch (err) {
              app.log.warn({ err }, `Failed to import user ${u.id}`);
            }
          }

          // Import charities
          for (const charity of dataPackage.data.charities) {
            const c = charity as any;
            try {
              await client.query(
                `INSERT INTO charities (id, name, jurisdiction, verified, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO UPDATE SET
                   name = $2, verified = $4, updated_at = $6`,
                [c.id, c.name, c.jurisdiction, c.verified, c.created_at, c.updated_at]
              );
              charitiesImported++;
            } catch (err) {
              app.log.warn({ err }, `Failed to import charity ${c.id}`);
            }
          }

          // Import transactions (immutable - skip if exists)
          for (const tx of dataPackage.data.transactions) {
            const t = tx as any;
            try {
              const exists = await client.query(
                'SELECT id FROM transactions WHERE id = $1',
                [t.id]
              );

              if (exists.rows.length === 0) {
                await client.query(
                  `INSERT INTO transactions 
                   (id, user_id, amount, charity_allocation, platform_fee, jurisdiction, status, created_at)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                  [
                    t.id,
                    t.user_id,
                    t.amount,
                    t.charity_allocation,
                    t.platform_fee,
                    t.jurisdiction,
                    t.status,
                    t.created_at,
                  ]
                );
                transactionsImported++;
              }
            } catch (err) {
              app.log.warn({ err }, `Failed to import transaction ${t.id}`);
            }
          }

          // Log import
          await client.query(
            `INSERT INTO data_imports (source_instance_id, total_records, conflicts, status)
             VALUES ((SELECT id FROM federation_instances WHERE id = $1), $2, $3, $4)`,
            [dataPackage.instanceId, usersImported + transactionsImported, conflicts.length, 'completed']
          );

          await client.query('COMMIT');

          reply.code(200).send({
            success: true,
            totalRecords: usersImported + transactionsImported + charitiesImported,
            conflicts: conflicts.length > 0 ? conflicts : undefined,
            imported: {
              users: usersImported,
              transactions: transactionsImported,
              charities: charitiesImported,
            },
          });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      } catch (error) {
        app.log.error({ err: error }, 'Import failed');
        reply.code(500).send({
          success: false,
          error: 'Import failed',
        });
      }
    }
  );

  /**
   * GET /federation/import/status/:importId
   * Check status of import operation
   */
  app.get<{ Params: { importId: string } }>(
    '/federation/import/status/:importId',
    {
      onRequest: [app.authenticate],
      schema: {
        description: 'Check import status',
        tags: ['federation'],
        params: {
          type: 'object',
          properties: {
            importId: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { importId: string } }>, reply: FastifyReply) => {
      try {
        const { importId } = request.params;

        const result = await db.query(
          'SELECT * FROM data_imports WHERE id = $1',
          [importId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({
            success: false,
            error: 'Import not found',
          });
        }

        reply.code(200).send({
          success: true,
          import: result.rows[0],
        });
      } catch (error) {
        app.log.error({ err: error }, 'Status check failed');
        reply.code(500).send({
          success: false,
          error: 'Status check failed',
        });
      }
    }
  );
}

export default registerImportRoutes;
