---
name: review-checklist
description: Runs all pre-review checks (build, tests, typecheck, lint, E2E) and documents results. Use /review-checklist before creating a PR.
disable-model-invocation: true
---

# Review Checklist

Run ALL checks below before creating a PR or requesting review.

## Prerequisites

- Confirm there is an open GitHub Issue for this work
- Confirm all code changes are committed on the feature branch

## Checks (run in order)

### 1. TypeScript Check
```bash
npm run typecheck
```
Document: "passed" or list errors.

### 2. ESLint
```bash
npx next lint
```
Document: "0 errors, X warnings" or list errors. Warnings are acceptable, errors are not.

### 3. Unit Tests
```bash
npm run test
```
Document: "X/Y passed" + coverage % if available.

### 4. Build
```bash
npm run build
```
Document: "passed" or list errors. Must succeed.

### 5. E2E Tests (if UI changes were made)
```bash
npx playwright test
```
Document: "X/Y passed" or list failures.

## After All Checks Pass

1. Create PR with `gh pr create`:
   - Title: short description
   - Body: `Closes #<issue-number>` + summary of changes
   - Reference test results in PR body

2. Request review if needed

## If Any Check Fails

- Do NOT create the PR
- Fix the issue first
- Re-run failed checks
