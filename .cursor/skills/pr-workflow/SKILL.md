---
name: pr-workflow
description: Automates git commits using Conventional Commits format and creates pull requests with properly filled PR templates. Use when the user asks to commit changes, create a PR, raise a pull request, or submit code for review. Handles staging, commit message generation, branch management, and PR template completion.
---

# PR Workflow

Automates the complete PR workflow: stage changes, create commits with Conventional Commits format, push branches, and create PRs with filled templates.

## Quick Start

1. Stage and commit: Follow commit workflow below
2. Push branch: `git push -u origin HEAD`
3. Create PR: Use `gh pr create` with filled template

## Commit Workflow

### Step 1: Check Current State

```bash
git status
git diff --staged
git diff
```

### Step 2: Stage Changes

```bash
# Stage specific files
git add <file1> <file2>

# Or stage all changes
git add .
```

### Step 3: Create Commit Message

Use **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Commit Types

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

#### Examples

```bash
# Feature
git commit -m "$(cat <<'EOF'
feat(auth): add JWT token refresh mechanism

Implements automatic token refresh before expiry
EOF
)"

# Bug fix
git commit -m "$(cat <<'EOF'
fix(dashboard): correct date formatting in reports

Use UTC timestamps consistently across report generation
EOF
)"

# Refactor
git commit -m "$(cat <<'EOF'
refactor(api): extract common validation logic

Move repeated validation into shared utility functions
EOF
)"
```

### Step 4: Push Branch

```bash
git push -u origin HEAD
```

## PR Creation Workflow

### Step 1: Analyze Changes

```bash
# View all commits on this branch vs main
git log main..HEAD --oneline

# View full diff against main
git diff main...HEAD
```

### Step 2: Determine PR Type

Based on commits, identify the primary change type:

- 🐛 Bug fix
- ✨ New feature
- 💥 Breaking change
- 📚 Documentation
- 🔧 Refactoring
- ⚡ Performance
- 🧪 Test coverage
- 🔒 Security

### Step 3: Create PR with Template

```bash
gh pr create --title "<type>(<scope>): <description>" --body "$(cat <<'EOF'
## 📋 PR Description

### What does this PR do?
<Clear description of changes and their purpose>

### Type of Change
- [x] <primary_type>

## 🔗 Related Issues & Docs
- Product Doc: <link or N/A>
- IMPL Doc: <link or N/A>
- Closes Issue: <linear ticket or N/A>
- Design: <figma link or N/A>

## 🧪 Testing

### Manual Testing
- [x] Tested locally in development environment
- [x] Verified functionality works as expected
- [x] Tested edge cases and error scenarios
- [x] Checked for regressions in related functionality

### Automated Testing
- [x] Added/updated unit tests
- [x] All existing tests pass
- [x] Test coverage maintained or improved

## 📱 Screenshots/Videos
<Add screenshots for UI changes>

## 🏗️ Technical Details

### Architecture Changes
<Describe architectural decisions>

### Dependencies / Libraries
- [x] No new dependencies added

## ✅ Patterns Checklist
- [x] Custom hooks follow `use` prefix convention
- [x] Provider pattern used appropriately
- [x] Anti-patterns avoided

## 📖 Documentation
- [x] Complex logic has explanatory comments

## 🔍 Review Focus Areas
- <Area 1>
- <Area 2>

## 📝 Additional Notes
<Any additional context>
EOF
)"
```

## Complete Example Workflow

```bash
# 1. Check status
git status

# 2. Stage changes
git add .

# 3. Commit with conventional format
git commit -m "$(cat <<'EOF'
feat(components): add new DataTable component

- Implements sortable columns
- Adds pagination support
- Includes search functionality
EOF
)"

# 4. Push branch
git push -u origin HEAD

# 5. Create PR
gh pr create --title "feat(components): add new DataTable component" --body "..."
```

## Checklist Template

Copy and track progress:

```
PR Workflow Progress:
- [ ] Changes staged
- [ ] Commit created with Conventional Commits format
- [ ] Branch pushed to remote
- [ ] PR created with filled template
- [ ] PR link shared with user
```

## Additional Resources

- For PR template details, see [pr-template-guide.md](pr-template-guide.md)
- For commit examples, see [commit-examples.md](commit-examples.md)
