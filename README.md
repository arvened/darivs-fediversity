# DARIVS Fediversity

> ⚠️ **Project status: pre-grant proof of concept.**
> This repository contains an early architectural prototype. It was written to demonstrate
> technical feasibility while our NGI Fediversity grant application (2026-08-0d7) is under
> eligibility review. **No grant has been awarded.** Development is intentionally paused
> until the review is decided. Nothing here is production-ready, published, or deployed.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What this project is

DARIVS Fediversity is a planned self-hosted platform for charitable prediction challenges,
built around **service portability**: an organisation should be able to run its own instance,
own its data, and move users and records to another instance without losing history.

## What exists today

- A Fastify + TypeScript application skeleton (`src/app.ts`) with health, version and info endpoints
- A prototype federation protocol (`src/federation/protocol.ts`): data package format,
  SHA-256 checksums, package validation and user-conflict detection
- A prototype instance registry (`src/federation/registry.ts`)
- Draft export/import HTTP routes (`src/api/federation/`) — untested against a real database
- A draft PostgreSQL schema (`src/db/schema.sql`) and domain types
- Unit tests (Jest) for the federation protocol, the registry and the basic HTTP endpoints,
  run in CI on every push

## Known limitations (to be addressed in the funded work)

- **No real cryptographic signatures yet.** Packages carry a SHA-256 integrity tag, not an
  asymmetric signature; anyone who knows an instance's public key can forge it.
  Ed25519 signatures are planned.
- Export/import routes and the database schema have no integration tests yet.
- `Dockerfile` / `docker-compose.yml` are included but not yet verified.
- No UI, no multi-instance test environment, no security audit, no legal/GDPR review yet.

## Running the prototype locally

Requires Node.js 20 or newer.

```bash
git clone https://github.com/arvened/darivs-fediversity.git
cd darivs-fediversity
npm install
npm test          # unit tests with coverage report
npm run build     # type-check and compile to dist/
```

The unit tests do not need a database.

## Repository layout

```
src/
  app.ts                  Fastify application
  api/federation/         Draft export/import routes
  federation/             Federation protocol and instance registry (prototype)
  db/                     Draft schema and domain types
  __tests__/              Jest tests
docs/DEVELOPMENT.md       Planned work plan
```

## Roadmap

The planned grant-funded work (production cryptography, integration tests, multi-instance
federation, UI, independent security audit, compliance review) is described in
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md). None of it has started.

## Team

See [CONTRIBUTORS.md](CONTRIBUTORS.md).

## License

MIT — see [LICENSE](LICENSE).

## Contact

hello@arvend.io
