---
description: # Workflow: Production Deployment (Pre-Flight & Deploy)
---

# Workflow: Production Deployment (Pre-Flight & Deploy)
**Trigger:** Run this before running `netlify deploy` or pushing to the production branch (`main`).

**Step 1: The "Clean" Build & Integrity Check**
1.  **Purge:** Delete the existing `dist/` (or `build/`) folder.
2.  **Linting:** Run `npm run lint`.
3.  **Test:** Run `npm test -- --run` to ensure all tests pass.
4.  **Build:** Run `npm run build`.
5.  **Analysis:** If the build fails, STOP. Analyze the error.

**Step 1.5: Security Check**
1.  Run `npm audit --audit-level=high`.
2.  **Constraint:** If High vulnerabilities exist, deployment fails.
3.  Check for `.env` files in the commit history (ensure secrets aren't exposed).

**Step 2: Production Preview**
*Why:* Verify variables/paths in a production-like build.
1.  Run `npm run preview`.
2.  **Action:** Open preview URL.
3.  **Check:** Does the "Breadcrumb" feature work? Do crucial flows (routing) work?

**Step 3: Netlify Compliance Check**
1.  **SPA Routing:** Check if `public/_redirects` or `netlify.toml` exists.
    * *Rule:* Must handle `/* /index.html 200` for client-side routing.
2.  **Environment Variables:** Verify required variables are set in Netlify Dashboard.

**Step 4: Version Management (CRITICAL)**
*Update version number before pushing.*
1.  Open `package.json`.
2.  Locate the `"version"` field.
3.  **Increment the version number** based on SemVer:
    - **Patch (x.x.1):** Bug fixes, minor tweaks.
    - **Minor (x.1.0):** New features, significant refactors.
    - **Major (2.0.0):** Breaking changes.
    *Example:* `1.2.0` -> `1.3.0`.

**Step 5: Commit & Push (Deploys to Production)**
1.  Stage changes: `git add .`
2.  Commit with release note: `git commit -m "Release v<VERSION>: <DESCRIPTION>"`
3.  **Push:** `git push origin main`
    *Note:* Pushing to `main` triggers the Netlify deployment locally connected.

**Step 6: Post-Deployment**
1.  Monitor GitHub Actions / Netlify Build.
2.  Verify the live URL.
