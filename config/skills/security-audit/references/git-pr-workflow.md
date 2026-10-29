# Advanced Git & PR Orchestration Reference

## 1. Sentry-Style Conventional Commits Standard
Format: `<type>(<scope>): <short description>`
- `feat(auth)`: Add biometric session refresh
- `fix(billing)`: Prevent duplicate subscription charging
- `refactor(db)`: Eliminate correlated subquery in user lookup
- `test(e2e)`: Add Playwright checkout flow coverage
- `chore(deps)`: Bump zod from 3.22 to 3.24

Body Guidelines:
- State *Why* the change is made, not just *What* changed.
- Reference issue keys: `Fixes #123` or `Closes PROJ-456`.

---

## 2. Smart Git Push & Pre-Push Gate
Before pushing:
1. Verify working directory is clean: `git status --porcelain`.
2. Ensure current branch is not `main`/`master`:
   ```bash
   BRANCH=$(git rev-parse --abbrev-ref HEAD)
   if [ "$BRANCH" = "main" ]; then
     echo "Direct push to main is blocked. Create a feature branch."
     exit 1
   fi
   ```
3. Fetch and rebase against remote upstream to prevent merge bubbles:
   ```bash
   git fetch origin main && git rebase origin/main
   ```

---

## 3. GitHub CLI (`gh`) PR Automation
```bash
# Create structured PR with automated metadata
gh pr create \
  --title "feat(billing): implement optimistic tier upgrade" \
  --body-file docs/pr-template.md \
  --label "enhancement" \
  --assignee "@me"
```
