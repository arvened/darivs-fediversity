# Contributing to DARIVS Fediversity

Thank you for your interest! Please note that this repository is a **pre-grant proof of
concept** and active development is paused until the NGI Fediversity review is decided.
Issues, questions and small fixes are still welcome.

## Code of Conduct

Be respectful, inclusive and constructive in all interactions.

## Getting started

```bash
git clone https://github.com/YOUR-USERNAME/darivs-fediversity.git
cd darivs-fediversity
npm install
npm test
npm run build
```

Node.js 20 or newer is required. The unit tests do not need a database.

## Making changes

1. Create a branch from `main`, e.g. `fix/registry-health-score` or `docs/update-readme`.
2. Keep TypeScript strict mode clean: `npm run build` must pass.
3. Add or update tests for the code you change: `npm test` must pass.
4. Format with `npm run format` before committing.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
fix: correct health score recovery in instance registry
docs: clarify prototype limitations in README
feat: add Ed25519 package signatures
```

Reference related issues where relevant, e.g. `Fixes #12`.

## Pull requests

- Give the PR a clear title and describe what changed and why.
- CI (build + tests) must be green.
- A maintainer will review and merge.

## Security

Never commit secrets, private keys, `.env` files, credentials or personal data.

Please report security issues privately to **hello@arvend.io** rather than opening a
public issue.

## Questions

Open a GitHub issue or email hello@arvend.io.

Contributors are listed in [CONTRIBUTORS.md](CONTRIBUTORS.md).
