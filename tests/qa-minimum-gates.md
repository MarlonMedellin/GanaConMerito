# QA Summary

- Current E2E suite is production-oriented and validates auth boundaries, `/practice` availability, and some UX checkpoints (`production-practice-contract`, `authenticated-practice`, `online-five-question*`).
- There is partial coverage for regression-sensitive behaviors (idempotency, login redirects, API session forensics), but at least one test is observational-only (no hard assertion), which weakens CI gate value.
- The minimum safe MVP gate should focus on deterministic critical-path checks rather than broad or vanity metrics.

# Critical Missing Tests

1. **Hard assertion for idempotency contract**
   - Existing test records evidence but does not fail CI when question persistence breaks.
2. **Session terminal transition contract**
   - Missing explicit check that session reaches terminal status after answering 5/5 and cannot continue advancing.
3. **Resilience on auth-expired state**
   - Missing deterministic test that stale auth state returns user to login/onboarding with actionable UI.
4. **API/UI consistency for active question**
   - Missing integration-level assertion that rendered question id/text matches backend session payload.

# Regression Risks

- **Silent regressions in practice idempotency** due to non-blocking checks in test logic.
- **False confidence from screenshot-heavy runs** where visual capture exists but contract assertion is weak.
- **Potential selector fragility** (`.option-card`, broad `main` text comparisons) if layout changes.
- **Environment-coupled flakiness** from direct production target and variable data state.

# Flaky Test Findings

- Reliance on `waitForTimeout(4000)` and `networkidle` can produce timing variance.
- Generic full-page text comparison (`main.innerText`) may fail on non-critical copy/timestamp changes.
- Conditional branches that allow multiple pass paths without strict invariant can hide true failures.

# Recommended Gates

## Gate A (Required per PR)
- Authenticated user can open `/practice` without login redirect.
- User can start practice and see answer options.
- No critical 5xx in first-page practice flow.

## Gate B (Required before release)
- Idempotency behavior validated with explicit assertion.
- Five-question flow reaches terminal UX state.
- Production contract report generated and archived.

## Gate C (Nightly)
- Forensics suite (auth/login/session API) with richer diagnostics.
- Optional screenshot artifacts and network logs.

# Priority Testing Plan

1. Convert observational tests into deterministic assertions (done for idempotency gate).
2. Reduce flaky waits (`waitForTimeout`) and prefer event/state-based waits.
3. Standardize stable selectors for practice options and question container.
4. Add explicit acceptance criteria mapping per test file (test name -> contract).
5. Split smoke-required tests from forensic-deep tests to optimize CI runtime.

# Files Reviewed

- `tests/e2e/production-practice-contract.spec.ts`
- `tests/e2e/idempotency-practice-test.spec.ts`
- `tests/e2e/authenticated-practice.spec.ts`

# Files Modified

- `tests/e2e/idempotency-practice-test.spec.ts`
- `tests/qa-minimum-gates.md`

# Testing Debt

- Missing deterministic integration test coverage for session lifecycle terminality.
- Over-reliance on runtime production environment for primary signal.
- Inconsistent assertion strictness across E2E files.
- Limited explicit flake-mitigation patterns (retries strategy, deterministic waits, stable fixtures).

# Final Status

needs-fix
