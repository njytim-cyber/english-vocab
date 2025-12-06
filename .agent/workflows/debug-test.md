---
description: # Workflow: Debug, Test, & Crash Resolution
---

# Workflow: Debug, Test, & Crash Resolution
**Trigger:** Build failure, Red Unit Test, or Production Crash Report (Telemetry).

**Step 1: Analyze the Evidence**
Read the local error message OR external stack trace (from Sentry/Logs). Map the error to specific lines in `src/` (using Source Maps if analyzing production build). Read source code AND the relevant test file. **Constraint:** Do not write code yet. Explain the root cause to the user.

**Step 2: Targeted Fix / Reproduction**
**Protocol (Production Crash):** If handling a crash report, you MUST write a new Unit Test (`.test.jsx`) that reproduces the failure scenario first.
**Protocol (Local Error):** Apply fix to Component or Test.
**Constraint:** Change minimum lines possible.

**Step 3: Verification**
Run ONLY the failing test (or the newly created reproduction test). **Constraint:** The test must pass green before moving to the next step.

**Step 4: Pre-Production Check (Gatekeeper)**
Before publishing or pushing to the main branch, you MUST run a comprehensive verification.
1. **Unit/Integration Tests:** Run `npm test` (or equivalent) to ensure no regressions.
2. **E2E Tests:** Run critical E2E flows nearby the change (or full suite if risky).
3. **Build Check:** Ensure `npm run build` succeeds locally.
**Constraint:** Do NOT push if any of these fail.

**Step 5: Post-Push CI Verification**
After pushing to `main` (or opening a PR):
1.  **Monitor Actions:** Watch the GitHub Actions tab.
2.  **Verify Green:** Confirm all jobs (`integrity`, `verification`, `build`) pass.
3.  **Fix Regressions:** If CI fails (even if local tests passed), treat it as a Step 1 Trigger and restart the workflow.
