# Development Plan — DARIVS Fediversity

> **Status:** NGI Fediversity grant application 2026-08-0d7 (€40,000 requested) is under
> eligibility review. **No funding has been awarded.** The work plan below describes what
> the grant would fund; none of it has started.

## Pre-grant proof of concept (done, not grant-funded)

Written before and during the application to demonstrate feasibility:

- Fastify + TypeScript application skeleton, strict type-checking
- Prototype federation protocol: data package format, SHA-256 checksums, validation,
  conflict detection
- Prototype instance registry
- Draft export/import routes and draft PostgreSQL schema
- Unit tests and CI (build + tests)

Known limitations are listed in the [README](../README.md#known-limitations-to-be-addressed-in-the-funded-work).

## Planned grant-funded work (16 weeks)

### Weeks 1–4: Federation protocol and service portability
- Federation protocol specification
- Real asymmetric package signatures (Ed25519) replacing the prototype integrity tag
- Instance discovery (registry) and health checks
- Data export / import endpoints with integration tests against PostgreSQL
- Database migrations for federation tables
- Multi-instance test environment (Docker)

### Weeks 5–7: Backend
- Transaction split service with full edge-case coverage
- Hash-chain audit trail
- Compliance logging
- Dispute resolution and settlement workflow

### Weeks 8–10: User interface
- Charity admin dashboard
- Data portability UI (export / import workflows)
- Personal data download (GDPR)
- Instance settings

### Weeks 11–13: Federation and compliance
- Cross-instance user migration
- Jurisdiction-aware configuration
- GDPR data subject request workflow
- Compliance reporting

### Weeks 14–15: Independent security audit and hardening
- External security review and penetration testing
- Cryptographic verification review
- Rate limiting, authentication hardening
- Fixes for audit findings

### Week 16: Documentation and release
- Self-hosting guide and service portability playbook
- API documentation (OpenAPI)
- Backup and recovery procedures
- First tagged release

## Development workflow

```bash
npm install
npm run dev        # run with ts-node
npm test           # tests with coverage
npm run build      # compile to dist/
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for branch and commit conventions.
