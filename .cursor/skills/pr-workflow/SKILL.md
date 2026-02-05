---
name: pr-workflow
description: Automates git commits using Conventional Commits format and creates pull requests with GitHub CLI. Use when the user asks to commit changes, create a PR, raise a pull request, submit code for review, or resolve PR comments. Handles staging, commit message generation, branch management, PR template completion, and PR comment resolution.
---

# PR Workflow

Automates commits with Conventional Commits format, PR creation via GitHub CLI, and PR comment resolution.

## Important Rules

1. **Commit messages MUST be single line** - No multi-line commits
2. **Do NOT create PR unless user explicitly asks** - Only commit and push by default
3. **Check for `gh` CLI before PR operations** - Install if missing
4. **ALWAYS check for console.log statements before committing** - Remove debug logs before pushing

## Commit Workflow

### Step 1: Check Current State

```bash
git status
git diff --staged
git diff
```

### Step 2: Check for console.log Statements (MANDATORY)

**CRITICAL**: Before any commit, push, or PR creation, scan for `console.log` statements in the changed files.

```bash
# Check staged files for console.log
git diff --staged --name-only | xargs grep -l "console.log" 2>/dev/null

# Check all changed files (staged + unstaged)
git diff --name-only HEAD | xargs grep -n "console.log" 2>/dev/null

# More comprehensive check including console.warn, console.error used for debugging
git diff --staged --name-only | xargs grep -nE "console\.(log|warn|info|debug)" 2>/dev/null
```

**If console.log statements are found:**

1. **Review each occurrence** - Determine if it's intentional logging or debug code
2. **Remove debug console.log statements** - These should not be committed
3. **Keep intentional logging** - Error handling, analytics, or monitoring logs may be valid
4. **Ask user if unsure** - "Found console.log at [file:line]. Is this intentional logging or debug code to remove?"

**Acceptable console statements:**

- `console.error()` for actual error handling
- Logging in development-only code paths
- Intentional analytics/monitoring

**Must be removed:**

- Debug `console.log()` statements
- Temporary debugging output
- `console.log` with variable dumps like `console.log('data:', data)`

### Step 3: Stage Changes

```bash
git add <file1> <file2>
# Or stage all
git add .
```

### Step 4: Create Single-Line Commit Message

**Format**: `<type>(<scope>): <description>`

**IMPORTANT**: Always use single-line commit messages. Never use multi-line.

| Type       | When to Use                             |
| ---------- | --------------------------------------- |
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `docs`     | Documentation only                      |
| `style`    | Formatting, no code change              |
| `refactor` | Code change that neither fixes nor adds |
| `perf`     | Performance improvement                 |
| `test`     | Adding or updating tests                |
| `chore`    | Build process, dependencies, tooling    |

**Examples:**

```bash
git commit -m "feat(auth): add JWT token refresh mechanism"
git commit -m "fix(dashboard): correct date formatting in reports"
git commit -m "refactor(api): extract common validation logic"
```

### Step 5: Push Branch

```bash
git push -u origin HEAD
```

### Step 6: Update PR Description (If PR Exists)

After pushing commits, check if a PR already exists for the branch. If so, update the PR description to reflect the new changes.

```bash
# Check if PR exists for current branch
gh pr view --json number,title,body

# If PR exists, update the description with new changes
gh pr edit --body "<updated_pr_template>"
```

**When to update PR:**

- New commits added to an existing PR
- Scope of changes expanded
- Reviewer requested clarification

## PR Creation Workflow (Only When User Asks)

**CRITICAL**: Only proceed with PR creation if user explicitly requests it.

### Step 1: Check GitHub CLI Installation

```bash
# Check if gh is installed
which gh || command -v gh

# If not installed, install it:
# macOS
brew install gh

# Then authenticate
gh auth login
```

### Step 2: Get PR Template from Repository

```bash
# Check for PR template in repo
gh api repos/{owner}/{repo}/contents/.github/PULL_REQUEST_TEMPLATE.md --jq '.content' | base64 -d

# Or check common locations
cat .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null || \
cat .github/pull_request_template.md 2>/dev/null || \
cat PULL_REQUEST_TEMPLATE.md 2>/dev/null
```

### Step 3: Analyze Changes for PR

```bash
git log main..HEAD --oneline
git diff main...HEAD
```

### Step 4: Create PR with GitHub CLI

```bash
gh pr create --title "<type>(<scope>): <description>" --body "<filled_template>"
```

**PR Description Format:**

```markdown
**Summary**: <One sentence overview>

**Changes:**

- <What was added/modified/removed>
- <What was added/modified/removed>

**Impact:**

- <How this affects users/system>
```

### Step 5: Share PR Link

After creation, share the PR URL with the user.

## Resolve PR Comments Workflow

When user asks to resolve PR comments:

### Step 1: Get PR Comments

```bash
# List open PRs
gh pr list

# Get comments on current branch's PR
gh pr view --comments

# Or get comments for specific PR number
gh pr view <PR_NUMBER> --comments

# Get review comments (code-level comments)
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments --jq '.[] | {path: .path, line: .line, body: .body}'
```

### Step 2: Analyze and Fix Comments

1. Read each comment
2. Understand the requested change
3. Make the code changes
4. Stage and commit with descriptive message:
   ```bash
   git commit -m "fix(pr): address review feedback on <component>"
   ```

### Step 3: Push Changes

```bash
git push
```

### Step 4: Optionally Reply to Comments

```bash
# Reply to a review comment
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments/<COMMENT_ID>/replies -f body="Fixed in latest commit"
```

## PR Template

Fill based on repository's template. Default structure:

```markdown
## 📋 PR Description

### What does this PR do?

**Summary**: <One sentence overview>

**Changes:**

- <What was added/modified/removed>
- <What was added/modified/removed>

**Impact:**

- <User/system impact>

### Type of Change

- [x] <primary_type>

## 🔗 Related Issues & Docs

- Closes Issue: <linear ticket or N/A>

## 🧪 Testing

- [x] Tested locally
- [x] Verified functionality works as expected

## 📱 Screenshots/Videos

<Add screenshots for UI changes, or N/A>

## 🔍 Review Focus Areas

- <Area needing attention>
```

## Workflow Checklist

```
Commit Workflow:
- [ ] Changes reviewed (git status, git diff)
- [ ] console.log statements checked and removed (MANDATORY)
- [ ] Changes staged
- [ ] Single-line commit message created
- [ ] Branch pushed to remote
- [ ] PR description updated (if PR exists)

PR Creation (only if requested):
- [ ] console.log check passed (no debug logs)
- [ ] gh CLI installed and authenticated
- [ ] PR template fetched from repo
- [ ] PR created with filled template
- [ ] PR link shared with user

PR Comment Resolution (only if requested):
- [ ] PR comments fetched via gh CLI
- [ ] Code changes made to address feedback
- [ ] console.log check passed before pushing
- [ ] Changes committed and pushed
```

## Additional Resources

- For commit examples, see [commit-examples.md](commit-examples.md)
- For PR template details, see [pr-template-guide.md](pr-template-guide.md)
