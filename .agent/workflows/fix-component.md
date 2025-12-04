---
description: # Workflow: Safe Fix / Refactor **Trigger:** Use when modifying an existing file.
---

# Workflow: Safe Fix / Refactor
**Trigger:** Use when modifying an existing file.

**Step 1: Scope Analysis**
Read the target file.
1.  List all `exports`.
2.  Scan the codebase to find who imports these exports.
3.  **Safety Check:** Will changing these exports break the consumers?

**Step 2: Execution**
1.  Apply the fix.
2.  **Constraint:** Do not change the `props` interface unless explicitly requested.
3.  If internal logic changes, verify if `feature_state_logic.md` needs updating.

**Step 3: Verification**
1.  Run the specific unit test for this component (if it exists).
2.  If no test exists, suggest creating one before finishing.

**Step 4: E2E Verification**
1.  Trigger the `e2e-verify` workflow to ensure no regressions in user flows.
    - Run: `npx playwright test` (or specific test if applicable).
