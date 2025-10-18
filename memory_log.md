Project Memory Log - Top Loader Agent AI

Date: 2025-10-17

Overview

- Workspace: C:\Users\toplo\Desktop\ai_stuff\Ai_calling_centre\ai_calling_centra_code
- Goal: Use an open-source CRM (frappe/crm) as the base, rebrand it to "Top Loader Agent AI", and integrate AI features, our design, and personalization to create a custom calling center CRM.
- User plan for today: Clone the CRM into a newly created `codebase_new` directory, build it to ensure it runs, then begin editing and integrating required features.

What we've discussed

- You found the open-source CRM repo: https://github.com/frappe/crm.git
- The intention is to clone it into an existing folder named `codebase_new` and rename the cloned folder to `top-loader-agent-ai`.
- We will not keep the original repo name in the final product; this will be rebranded.
- Primary tasks: clone, build, run, then modify.

Assumptions & Notes

- You already created the directory `codebase_new` in the workspace root.
- The environment is Windows, default shell PowerShell.
- We have internet access to clone repositories from GitHub.
- We'll keep the original repo as an upstream remote to pull updates if needed.

Immediate plan (today)

1. Clone https://github.com/frappe/crm.git into `codebase_new/top-loader-agent-ai`.
2. Verify the clone succeeded and list files.
3. Inspect the repo for build instructions (README, package.json, etc.).
4. Attempt an initial build/run following upstream instructions. If build requires dependencies (like Yarn, Node, Python, etc.) note them.
5. If the build succeeds, create a branch for rebranding and start minimal rename tasks.

Next steps (post-clone)

- Create an initial branch `rebrand/top-loader-agent-ai`.
- Replace branding assets and names in code and configs.
- Plan AI integration points: campaign generation, script suggestion, call automation hooks, analytics.
- Wire up authentication and data models as needed.

TODOs

- Clone the repo into `codebase_new` as `top-loader-agent-ai` (completed)
- Verify and attempt build (next)
- Create branch for rebranding
- Start incremental changes and add tests

Build notes (initial inspection)

- The repository contains a `frontend` directory that uses Vue 3 + Vite. The `frontend/package.json` scripts use `yarn`:
	- `yarn dev` to run the frontend in development
	- `yarn build` to build the frontend (copies built assets into `../crm/www/crm.html`)
- Required tools likely include: Node.js (18+ recommended for modern Vite), Yarn (or use `npm` with minor script edits), and Python/Frappe stack for backend if full platform is required. For a quick frontend start only Node + Yarn are needed.

Quick commands to run from Windows PowerShell (workspace root):

```powershell
cd C:\Users\toplo\Desktop\ai_stuff\Ai_calling_centre\ai_calling_centra_code\codebase_new\top-loader-agent-ai\frontend
yarn install
yarn dev
```

If you prefer npm, you'll need to translate the `yarn` commands and possibly adjust the `copy-html-entry` script which uses `cp` (Windows `copy` or use Git Bash/WSL).

Recorded by: Assistant
