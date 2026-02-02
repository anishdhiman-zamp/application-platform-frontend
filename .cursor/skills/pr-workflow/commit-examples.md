# Commit Message Examples

Single-line Conventional Commits examples. **All commits must be single line.**

## Format

```
<type>(<scope>): <description>
```

- **type**: Category of change
- **scope**: Component/area affected (optional but recommended)
- **description**: Concise summary (50 chars max recommended)

## Feature Commits

```bash
git commit -m "feat(components): add DataTable component with sorting"
git commit -m "feat(auth): implement JWT token refresh mechanism"
git commit -m "feat(api): add user preferences endpoints"
git commit -m "feat(dashboard): add real-time notifications"
git commit -m "feat(forms): implement multi-step wizard component"
```

## Bug Fix Commits

```bash
git commit -m "fix(dashboard): correct chart tooltip positioning"
git commit -m "fix(forms): prevent duplicate form submissions"
git commit -m "fix(reports): handle null dates in export"
git commit -m "fix(auth): resolve token expiry race condition"
git commit -m "fix(ui): correct button alignment on mobile"
```

## Refactor Commits

```bash
git commit -m "refactor(utils): extract date formatting utilities"
git commit -m "refactor(state): migrate auth state to RTK Query"
git commit -m "refactor(lists): implement virtual scrolling"
git commit -m "refactor(api): consolidate error handling logic"
git commit -m "refactor(hooks): simplify useAuth implementation"
```

## Documentation Commits

```bash
git commit -m "docs(readme): update local development setup"
git commit -m "docs(api): add JSDoc comments to auth utilities"
git commit -m "docs(components): add Storybook documentation"
git commit -m "docs(contributing): update PR guidelines"
```

## Style Commits

```bash
git commit -m "style(components): apply consistent spacing"
git commit -m "style(buttons): standardize hover states"
git commit -m "style(forms): fix input field alignment"
```

## Test Commits

```bash
git commit -m "test(auth): add unit tests for token refresh"
git commit -m "test(api): add integration tests for user endpoints"
git commit -m "test(components): add snapshot tests for Button"
```

## Chore Commits

```bash
git commit -m "chore(deps): upgrade React to 19.0.0"
git commit -m "chore(ci): add lint check to PR workflow"
git commit -m "chore(config): update ESLint rules"
git commit -m "chore(build): optimize bundle configuration"
```

## Performance Commits

```bash
git commit -m "perf(lists): implement virtualization for large datasets"
git commit -m "perf(images): add lazy loading for gallery"
git commit -m "perf(api): add response caching"
```

## Breaking Change Commits

```bash
git commit -m "feat(api)!: change user endpoint response format"
git commit -m "refactor(auth)!: remove deprecated login method"
git commit -m "feat(config)!: require Node 18 minimum"
```

## PR Feedback Commits

When addressing PR review comments:

```bash
git commit -m "fix(pr): address review feedback on DataTable"
git commit -m "fix(pr): update error handling per review"
git commit -m "fix(pr): add missing type annotations"
git commit -m "fix(pr): improve variable naming per feedback"
```

## Best Practices

1. **Keep it single line** - Never use multi-line commits
2. **Be specific** - Describe what changed, not why
3. **Use present tense** - "add" not "added"
4. **Keep under 50 chars** - For the description part
5. **Use scope** - Helps identify affected area quickly
