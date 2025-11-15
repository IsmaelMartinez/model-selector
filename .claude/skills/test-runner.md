---
description: Smart test runner that chooses the right test suite based on context
tags: [testing, ci, quality]
---

# Test Runner Skill

You are helping run tests for the AI Model Selector project. Choose the appropriate test strategy:

## Decision Tree

1. **Is this for CI/CD or pre-commit?**
   - YES → Run `npm test` (fast tests only, 23 tests, ~2s)
   - NO → Continue to step 2

2. **Did you modify classification logic?**
   - YES → Run BOTH `npm test` AND `npm run test:llm`
   - NO → Continue to step 3

3. **Are you validating accuracy improvements?**
   - YES → Run `npm run test:llm` (48 tests, ~3min, downloads 1.2GB model first time)
   - NO → Run `npm test` (fast tests)

## Test Commands

```bash
# Fast tests (ALWAYS safe to run)
npm test

# LLM tests (ONLY run locally, never in CI)
npm run test:llm
```

## Expected Results

**Fast Tests (npm test):**
- 11 acceptance tests
- 7 integration tests
- 5 model recommendation tests
- Total: 23 tests
- Runtime: ~2 seconds
- All should pass ✅

**LLM Tests (npm run test:llm):**
- 48 classification accuracy tests
- Runtime: ~3 minutes
- Downloads: 1.2GB model (first run only)
- Expected: 95.2% accuracy (46/48 passing)

## After Running Tests

1. **If fast tests fail:**
   - Check the error messages
   - Fix the issues
   - Run `npm test` again
   - DO NOT commit if tests fail

2. **If LLM tests fail:**
   - Check if accuracy dropped below 95%
   - Review classification changes in `src/lib/classification/`
   - Consider reverting changes if accuracy significantly decreased
   - Document any expected accuracy changes

3. **All tests pass:**
   - Proceed with commit
   - Build and preview: `npm run build && npm run preview`
   - Verify functionality in browser

## Usage

When user asks to "run tests", use this skill to determine which tests to run and execute them appropriately.
