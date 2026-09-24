# Contributing to DARIVS Fediversity

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR-USERNAME/darivs-fediversity.git
cd darivs-fediversity

2. Create Branch
git checkout -b feature/week-X-your-feature-name
Branch naming:

	•	feature/week-X-feature-name - New features
	•	fix/week-X-bug-name - Bug fixes
	•	docs/update-readme - Documentation updates
	•	chore/week-X-task - Chores/refactoring

3. Setup Development Environment
npm install
cp .env.example .env
docker-compose up -d
npm run build
npm run test
Make Changes
Write clean, well-documented code
	•	Follow TypeScript strict mode
	•	Add tests for new features
	•	Update documentation if needed

5. Testing
# Run all tests
npm run test

# Watch mode while developing
npm run test:watch

# Check coverage
npm run test
open coverage/lcov-report/index.html
Minimum Coverage: 75% for all code

6. Code Quality
# Format code
npm run format

# Run linter
npm run lint

# Build TypeScript
npm run build
7. Commit
git add .
git commit -m "[WEEK-X] Feature description

- What changed
- Why it changed
- Breaking changes (if any)"
Commit message format:

	•	First line: [WEEK-X] Short description (50 chars max)
	•	Blank line
	•	Detailed explanation (wrapped at 72 chars)
	•	Reference issue: Fixes #123

8. Push & Pull Request
git push origin feature/week-X-your-feature-name


	•	Clear title
	•	Description of changes
	•	Link to related issue (if any)
	•	Checklist:
	•	Tests pass
	•	Coverage maintained (75%+)
	•	Code formatted
	•	Documentation updated
	•	No console errors

Pull Request Process

	1.	Ensure all checks pass (CI/CD)
	2.	Wait for code review
	3.	Address feedback
	4.	Maintainer merges when approved

Testing Guidelines

Unit Tests

Test individual functions/classes:

describe('TransactionCalculator', () => {
  test('should calculate split correctly', () => {
    const split = calculateSplit(100);
    expect(split.charityAllocation).toBe(35);
  });
});
INTEGIntrgation tests
Test API endpoints+database:
test('POST /api/v1/predictions should create prediction', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/predictions',
    payload: { ... },
  });
  expect(response.statusCode).toBe(201);
Documentation

Code Documentation
/**
 * Calculate transaction split (50/35/15)
 * @param amount - Total transaction amount
 * @returns Split breakdown with user/charity/platform portions
 * @throws Error if amount is negative
 */
export function calculateSplit(amount: number): TransactionSplit {
  // implementation
README Updates

Update if you change:

	•	API endpoints
	•	Configuration options
	•	Setup steps
	•	Features

Security

Do NOT Commit

	•	API keys or secrets
	•	.env files
	•	Private keys
	•	Database credentials
	•	Personal information

Reporting Vulnerabilities

Email: security@arvend.io


Do NOT open public issues for security vulnerabilities.

Development Standards

TypeScript

	•	Strict mode: Always
	•	Type annotations: Explicit
	•	No any types
	•	Use union types for options
// ✅ Good
function getValue(key: string): string | undefined {
  return cache.get(key);
}

// ❌ Bad
function getValue(key: any): any {
  return cache.get(key);
Error Handling
// ✅ Good
try {
  await database.query(sql);
} catch (error) {
  logger.error('Query failed', { error, sql });
  throw new ApplicationError('Database error', 500);
}

// ❌ Bad
try {
  await database.query(sql);
} catch (e) {
  console.log(e);
Logging
// Use structured logging
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Payment failed', { error, transactionId, amount });
Questions?

	•	Issues: GitHub Issues
	•	Discussions: GitHub Discussions
	•	Email: hello@arvend.io

Recognition

Contributors will be recognized in:

	•	CONTRIBUTORS.md
	•	GitHub contributors page
	•	Release notes

Thank you for making DARIVS better! 🎉

**Коммит:**
[WEEK-1] Add CONTRIBUTING.md - Contributor guide



}

}

---

**Загрузил? Говори "Да" → дальше! ✅**





}

});









Ma
Ch


4



