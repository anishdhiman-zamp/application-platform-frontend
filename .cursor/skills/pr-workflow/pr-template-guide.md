# PR Template Guide

Detailed guidance for filling out each section of the PR template.

## Section-by-Section Guide

### 📋 PR Description

#### What does this PR do?

Write 2-3 sentences explaining:

- The problem being solved or feature being added
- The approach taken
- The impact on users/system

**Good example:**

> This PR adds a new DataTable component with sortable columns and pagination. It replaces the existing static table implementation in the dashboard, improving performance for large datasets and providing a better user experience.

**Bad example:**

> Added DataTable component.

#### Type of Change

Check **one primary type** and optionally secondary types:

- 🐛 Bug fix - Fixes broken functionality
- ✨ New feature - Adds new capability
- 💥 Breaking change - Changes API or behavior
- 📚 Documentation - Docs only
- 🔧 Refactoring - Code cleanup, no behavior change
- ⚡ Performance - Speed/memory improvements
- 🧪 Test coverage - New or improved tests
- 🔒 Security - Security fixes or enhancements

### 🔗 Related Issues & Docs

| Field        | What to Include                       |
| ------------ | ------------------------------------- |
| Product Doc  | Notion link to product requirements   |
| IMPL Doc     | Notion link to implementation details |
| Closes Issue | Linear ticket (e.g., `ZMP-123`)       |
| Design       | Figma link for UI changes             |

If not applicable, write "N/A" instead of leaving blank.

### 🧪 Testing

#### Manual Testing

Check boxes for completed testing:

- **Tested locally** - Ran the app and verified changes work
- **Verified functionality** - Feature works as intended
- **Edge cases** - Tested unusual inputs, empty states, errors
- **Regressions** - Checked related features still work

#### Automated Testing

- **Unit tests** - Component/function level tests
- **Integration tests** - Tests for component interactions
- **All tests pass** - `npm test` succeeds
- **Coverage** - Coverage didn't decrease

### 📱 Screenshots/Videos

**Required for UI changes.** Include:

- Before/after screenshots for visual changes
- GIFs or videos for interactions
- Mobile and desktop views if responsive

Format:

```markdown
| Before         | After         |
| -------------- | ------------- |
| ![before](url) | ![after](url) |
```

### 🏗️ Technical Details

#### Architecture Changes

Describe:

- New patterns introduced
- Component structure decisions
- State management approach
- API integration approach

#### Dependencies / Libraries

If adding dependencies:

1. Name the dependency
2. Explain why it was chosen
3. Note alternatives considered

### ✅ Patterns Checklist

Check applicable patterns:

- **Custom hooks** - `useXxx` naming, single responsibility
- **Provider pattern** - Context for shared state
- **Compound components** - Proper composition
- **RTK Query** - Builder pattern for endpoints
- **cva** - Variant pattern for styling
- **Selectors** - Memoized derived state

### 📖 Documentation

- **README** - Update if setup/usage changed
- **Storybook** - Add stories for new components
- **Comments** - Explain complex logic
- **Notion** - Document new features

### 🔍 Review Focus Areas

List 2-3 specific areas where you want reviewer attention:

- Complex logic that needs verification
- Performance-sensitive code
- Security-related changes
- Areas where you're uncertain

### 📝 Additional Notes

Include:

- Known limitations
- Future improvements planned
- Migration notes
- Deployment considerations

## PR Title Format

Use Conventional Commits format:

```
<type>(<scope>): <description>
```

**Examples:**

- `feat(auth): add OAuth2 login support`
- `fix(dashboard): resolve chart rendering issue`
- `refactor(api): extract common error handling`
- `docs(readme): update installation instructions`

## Common Mistakes to Avoid

1. **Empty sections** - Fill all sections or write "N/A"
2. **Vague descriptions** - Be specific about what and why
3. **Missing screenshots** - Always include for UI changes
4. **Unchecked boxes** - Review and check applicable items
5. **No related issues** - Link Linear tickets when available
