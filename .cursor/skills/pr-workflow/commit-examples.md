# Commit Message Examples

Real-world examples of well-formatted Conventional Commits for this project.

## Feature Commits

### New Component

```
feat(components): add DataTable component with sorting

- Implements sortable columns with ascending/descending toggle
- Adds pagination with configurable page sizes
- Includes search functionality with debounced input
- Follows compound component pattern
```

### New Feature

```
feat(auth): implement JWT token refresh mechanism

Automatically refreshes tokens 5 minutes before expiry.
Uses RTK Query's baseQueryWithReauth pattern.

Closes: ZMP-456
```

### API Integration

```
feat(api): add user preferences endpoints

- GET /preferences - fetch user settings
- PATCH /preferences - update settings
- Implements optimistic updates with RTK Query
```

## Bug Fix Commits

### UI Bug

```
fix(dashboard): correct chart tooltip positioning

Tooltip was appearing off-screen on right edge.
Now calculates available space and flips direction.
```

### Logic Bug

```
fix(forms): prevent duplicate form submissions

Add loading state check before submit handler.
Disable submit button while request is pending.

Closes: ZMP-789
```

### Data Bug

```
fix(reports): handle null dates in export

Previously crashed when date field was null.
Now displays "N/A" for missing dates.
```

## Refactor Commits

### Code Cleanup

```
refactor(utils): extract date formatting utilities

Move repeated date formatting logic to shared utils.
Consolidates 5 different implementations into one.
```

### Architecture Change

```
refactor(state): migrate auth state to RTK Query

Replace custom Redux slice with RTK Query endpoints.
Improves caching and reduces boilerplate.
```

### Performance Refactor

```
refactor(lists): implement virtual scrolling

Replace standard list with react-window.
Handles 10,000+ items without performance degradation.
```

## Documentation Commits

```
docs(readme): update local development setup

Add instructions for:
- Environment variable configuration
- Database seeding
- Running tests
```

```
docs(api): add JSDoc comments to auth utilities

Document parameters, return types, and examples
for all exported functions in auth module.
```

## Style Commits

```
style(components): apply consistent spacing

Standardize padding and margins across card components.
No functional changes.
```

## Test Commits

```
test(auth): add unit tests for token refresh

- Test successful refresh flow
- Test expired token handling
- Test network error recovery
- Achieves 95% coverage for auth module
```

## Chore Commits

```
chore(deps): upgrade React to 19.0.0

Update React and related dependencies.
Run codemod for deprecated APIs.
```

```
chore(ci): add lint check to PR workflow

Run ESLint on all changed files.
Block merge if lint errors exist.
```

## Breaking Change Commits

```
feat(api)!: change user endpoint response format

BREAKING CHANGE: User object now uses camelCase keys.

Migration:
- `user_name` → `userName`
- `created_at` → `createdAt`

Update all consumers to use new format.
```

## Multi-line Commit Best Practices

### Structure

```
<type>(<scope>): <short summary (50 chars max)>

<body - explain what and why, not how>
<wrap at 72 characters>

<footer - references, breaking changes>
```

### When to Use Body

- Changes are not self-explanatory
- Multiple related changes in one commit
- Breaking changes need migration notes
- Closes or references issues

### When to Skip Body

- Change is obvious from diff
- Single small change
- Type already explains intent (e.g., `style:`, `chore:`)
