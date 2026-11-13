# One-Prompt AI Deployment Guide (GitHub Codespaces + Copilot)

## Step 1: Launch Codespace
1. Upload all files from this ZIP to a new GitHub repository (`aura-jewels`).
2. Click the green **`<> Code`** button -> **Codespaces** -> **Create codespace on main**.
3. Wait for the container to finish booting (it automatically installs all `npm` dependencies and **GitHub Copilot**).

---

## Step 2: Paste This Startup Prompt into Copilot Agent
Open the **Copilot Chat** sidebar in Codespaces (`Ctrl + Shift + I` or click the Copilot icon), switch the mode dropdown at the bottom to **Agent**, and paste this prompt:

> **Prompt to Copy & Paste:**
> ```text
> Read .github/copilot-instructions.md and DEPLOYMENT_GUIDE.md. Help me deploy Aura Jewels step-by-step right now: first verify dependencies, then run the Cloudflare login and D1 database creation commands in the terminal, update wrangler.jsonc with the generated database_id, apply remote migrations and seeds, deploy the Worker, update environment.prod.ts with the live Worker URL, test the Angular production build, and push the changes to GitHub. Pause only when I need to click a browser login link.
> ```

---

## Step 3: Using Copilot CLI Directly in Terminal (Alternative)
If you prefer running Copilot directly inside the Codespace terminal instead of the sidebar, type:
```bash
gh copilot
```
Follow the quick authentication prompt if asked, and paste the same prompt above!
