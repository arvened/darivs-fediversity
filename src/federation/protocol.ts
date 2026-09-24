import crypto from 'crypto';

// Federation protocol types
export interface FederationInstance {
  id: string;
  name: string;
  url: string;
  publicKey: string;
  supportedVersions: string[];
  createdAt: Date;
}

export interface DataPackage {
  version: '1.0';
  instanceId: string;
  exportedAt: string;
  data: {
    users: Record<string, unknown>[];
    transactions: Record<string, unknown>[];
    charities: Record<string, unknown>[];
    challenges: Record<string, unknown>[];
    predictions: Record<string, unknown>[];
  };
  checksum: string;
  signature: string;
}

export interface ExportResult {
  success: boolean;
  package?: DataPackage;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  totalRecords?: number;
  conflicts?: string[];
  error?: string;
}

/**
 * Federation Protocol (prototype)
 *
 * PROTOTYPE LIMITATION: the "signature" produced here is a SHA-256 integrity
 * tag computed over the checksum, the instance ID and the instance's PUBLIC
 * key. It detects accidental corruption but is NOT a cryptographic signature:
 * anyone who knows the public key can produce a valid tag. Replacing it with
 * real asymmetric signatures (e.g. Ed25519) is planned grant-funded work.
 * The private key is accepted for API compatibility but is not used yet.
 */
export class FederationProtocol {
  private instanceId: string;
  private publicKey: string;

  constructor(instanceId: string, _privateKey: string, publicKey: string) {
    this.instanceId = instanceId;
    this.publicKey = publicKey;
  }

  /**
   * Generate SHA-256 checksum of data package
   */
  generateChecksum(data: Record<string, unknown>): string {
    const jsonStr = JSON.stringify(data);
    return crypto.createHash('sha256').update(jsonStr).digest('hex');
  }

  /**
   * Compute the prototype integrity tag (see class comment).
   */
  private computeTag(checksum: string, instanceId: string, publicKey: string): string {
    return crypto
      .createHash('sha256')
      .update(`${checksum}${instanceId}${publicKey}`)
      .digest('hex');
  }

  /**
   * "Sign" a data package (prototype integrity tag, see class comment).
   */
  signPackage(_data: Record<string, unknown>, checksum: string): string {
    return this.computeTag(checksum, this.instanceId, this.publicKey);
  }

  /**
   * Verify a package tag against the remote instance's public key.
   */
  verifySignature(
    checksum: string,
    signature: string,
    remoteInstanceId: string,
    remotePublicKey: string
  ): boolean {
    return signature === this.computeTag(checksum, remoteInstanceId, remotePublicKey);
  }

  /**
   * Create exportable data package
   */
  createDataPackage(
    userData: Record<string, unknown>[],
    transactionData: Record<string, unknown>[],
    charityData: Record<string, unknown>[],
    challengeData: Record<string, unknown>[],
    predictionData: Record<string, unknown>[]
  ): DataPackage {
    const data = {
      users: userData,
      transactions: transactionData,
      charities: charityData,
      challenges: challengeData,
      predictions: predictionData,
    };

    const checksum = this.generateChecksum(data);
    const signature = this.signPackage(data, checksum);

    return {
      version: '1.0',
      instanceId: this.instanceId,
      exportedAt: new Date().toISOString(),
      data,
      checksum,
      signature,
    };
  }

  /**
   * Validate incoming data package
   */
  validatePackage(
    pkg: DataPackage,
    remotePublicKey: string
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check version
    if (pkg.version !== '1.0') {
      errors.push(`Unsupported version: ${pkg.version}`);
    }

    // Recalculate checksum
    const expectedChecksum = this.generateChecksum(pkg.data);
    if (expectedChecksum !== pkg.checksum) {
      errors.push('Checksum mismatch - data may be corrupted');
    }

    // Verify integrity tag
    const signatureValid = this.verifySignature(
      pkg.checksum,
      pkg.signature,
      pkg.instanceId,
      remotePublicKey
    );
    if (!signatureValid) {
      errors.push('Signature verification failed');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Detect conflicts between local and remote data
   */
  detectConflicts(
    localUsers: Record<string, unknown>[],
    remoteUsers: Record<string, unknown>[]
  ): string[] {
    const conflicts: string[] = [];
    const localIds = new Set(localUsers.map((u) => u.id));

    for (const remoteUser of remoteUsers) {
      if (localIds.has(remoteUser.id)) {
        conflicts.push(`User conflict: ${String(remoteUser.id)}`);
      }
    }

    return conflicts;
  }
}

// Default export
export default FederationProtocol;
