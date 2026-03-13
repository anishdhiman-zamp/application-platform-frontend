# Chat Reading Experience — Front-End Implementation Spec

> Zamp Design System · Chat Reading Experience · v1.0

Everything a principal React developer needs to implement the chat reading experience correctly — tokens, component architecture, the non-obvious decisions, and what not to touch.

---

## 1. Locked Design Constraints

These are non-negotiable. If something looks wrong, check here before "fixing" it.

> These values are the output of a full design critique. Do not change them without a design review.

| Property                 | Value                | Do not use            | Why                                                                                                                       |
| ------------------------ | -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Base font size           | `14px`               | `16px`                | Chat responses contain dense prose. 16px reads as a document editor, not a message thread.                                |
| Font family              | Inter Variable       | Static Inter          | Weight 420 requires the variable font axis. Static Inter only ships 400/500/600/700.                                      |
| Body font weight         | `420`                | `400`                 | 400 reads too light at 14px on white. 420 is the optically correct weight for this size.                                  |
| Weight scale             | 420 / 500 / 600      | 560 / 590 / 620 / 650 | Three stops is a system. Fractional stops between them are noise.                                                         |
| Body line-height         | `1.667` (23px)       | `1.5`                 | 1.5 at 14px is too dense for multi-paragraph reading. 1.667 matches Linear, Notion, and legibility research at this size. |
| Heading line-height      | `1.4`                | `1.5` or `1.667`      | Headings are labels, not prose. They should sit tighter than paragraphs.                                                  |
| Code line-height         | `1.5` (20px at 13px) | `1.667`               | Code needs a fixed grid. 1.5 aligns to the 4px base grid. 1.667 does not.                                                 |
| Prose max-width          | `620px`              | `680px+`              | 620px = ~65–70 chars per line at 14px Inter. Optimal reading range.                                                       |
| Grid unit                | `4px`                | `8px` grid            | Chat UI has tight density requirements. 8px grid creates too much air at small scales.                                    |
| Inline code color        | `#9B4A6B`            | `#B84B6F`             | Saturated pink strobes in dense paragraph text. The muted version carries the signal without visual fatigue.              |
| Code language label case | lowercase            | UPPERCASE             | Monospaced uppercase with letter-spacing on technical labels reads as 2015 Bootstrap. Lowercase at weight 500 is correct. |

---

## 2. Design Tokens

Two places to register tokens: CSS custom properties for runtime use, Tailwind config for utility class generation. Keep them in sync.

### CSS Custom Properties — globals.css

```css
:root {
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Colors */
  --color-chat-text: #2c2a26;
  --color-chat-body: #3d3a34;
  --color-chat-secondary: #6b6760;
  --color-chat-tertiary: #a09d98;
  --color-chat-accent: #1a6b4a;
  --color-chat-accent-bg: #f0f9f4;
  --color-chat-border: #e8e5e0;
  --color-chat-bg: #ffffff;
  --color-chat-bg-subtle: #fafaf9;
  --color-chat-code-bg: #f8f7f4;
  --color-chat-code-header: #f3f1ee;
  --color-chat-inline: #9b4a6b;
  --color-chat-inline-bg: #fdf4f7;

  /* Spacing (4px grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Chat prose */
  --prose-max-width: 620px;
  --prose-lh: 1.667;
  --heading-lh: 1.4;
  --code-lh: 1.5;
}
```

### Tailwind Config Extensions

> **Tailwind v4 note:** The codebase uses Tailwind v4. Theme extensions live in `tailwind.config.ts` under `theme.extend`.

```ts
// In packages/ui/tailwind.config.ts → theme.extend
fontFamily: {
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
},
fontWeight: {
  'chat-body': '420',
},
lineHeight: {
  'chat-prose':   '1.667',
  'chat-heading': '1.4',
  'chat-code':    '1.5',
},
colors: {
  chat: {
    text:         '#2C2A26',
    body:         '#3D3A34',
    secondary:    '#6B6760',
    tertiary:     '#A09D98',
    accent:       '#1A6B4A',
    border:       '#E8E5E0',
    'code-bg':    '#F8F7F4',
    'code-header':'#F3F1EE',
    inline:       '#9B4A6B',
    'inline-bg':  '#FDF4F7',
  },
},
maxWidth: {
  'chat-prose': '620px',
},
```

With this config you can write `font-chat-body`, `leading-chat-prose`, `max-w-chat-prose`, `text-chat-body` in className strings.

---

## 3. Font Loading & Weight 420

The most non-obvious part of this system. Weight 420 silently fails with the wrong font build.

### The Variable Font Requirement

Inter ships in two builds: static (discrete weights: 300/400/500/600/700) and variable (continuous axis: 100–900). Weight 420 only exists in the variable build. If you load static Inter, `font-weight: 420` will round to 400 — the text will look lighter than spec and you won't get an error.

### Correct next/font Setup

```ts
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  axes: ['opsz'], // enables optical size axis → full variable range
  display: 'swap',
  variable: '--font-sans',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});
```

> `next/font` doesn't expose weight 420 directly — it only takes discrete weight strings. The variable font is still loaded; use `font-weight: 420` in CSS after loading. The `axes: ['opsz']` option is what enables the full variable range.

### Verify Weight 420 Is Working

```tsx
// Render these side by side. If they look identical, you have static Inter.
<p style={{ fontWeight: 400 }}>Weight 400 — regular</p>
<p style={{ fontWeight: 420 }}>Weight 420 — chat body (should be slightly heavier)</p>
<p style={{ fontWeight: 500 }}>Weight 500 — medium (should be noticeably heavier than 420)</p>
```

---

## 4. Component Architecture

How the `@zamp-platform/chat` package maps to this design system.

### Component Tree

```
MessageContainer                    // message bubble wrapper, owns max-width: 620px
├── Message                         // single message, owns bg, border-radius, padding
│   ├── BlockRenderer               // routes block types to correct renderer
│   │   ├── MarkdownBlock           // react-markdown, owns prose styles
│   │   │   ├── p                   // 14px/420/1.667lh, margin-top: 16px
│   │   │   ├── h1                  // 22px/600/1.4lh, margin: 40px 0 8px
│   │   │   ├── h2                  // 18px/600/1.4lh, margin: 32px 0 8px
│   │   │   ├── ul / ol            // 14px/420/1.667lh, margin-top: 12px
│   │   │   ├── CodeBlock           // custom component — see §7
│   │   │   └── table               // custom component — see §8
│   │   └── TextBlock               // plain text fallback
│   └── MessageMeta                 // timestamp, model label — 11px/420
└── StreamingMessage                // same structure, adds streaming cursor
```

> The prose max-width belongs on `MessageContainer` or the wrapper inside `Message` — not on individual block elements. Setting it on each `p` is incorrect and will cause table/code overflow issues.

### Where Each Token Lives in Code

| Token                | Component                                | CSS / Tailwind class                      |
| -------------------- | ---------------------------------------- | ----------------------------------------- |
| max-width: 620px     | MessageContainer or article wrapper      | `max-w-chat-prose`                        |
| font: 14px/420/1.667 | MarkdownBlock prose wrapper div          | `text-[14px] font-[420] leading-[1.667]`  |
| h1: 22px/600/1.4     | components override in ReactMarkdown     | `text-[22px] font-semibold leading-[1.4]` |
| h2: 18px/600/1.4     | components override in ReactMarkdown     | `text-[18px] font-semibold leading-[1.4]` |
| code bg + color      | CodeBlock + inline code in MarkdownBlock | `text-chat-inline bg-chat-inline-bg`      |
| JetBrains Mono       | CodeBlock, inline code elements          | `font-mono`                               |

---

## 5. Markdown Rendering

The codebase uses `react-markdown` + `remark-gfm` + `rehype-slug` in `packages/chat/src/components/blocks/MarkdownBlock.tsx`.

### The Tailwind Typography Problem

Tailwind's `@tailwindcss/typography` plugin (the `prose` class) will fight you. It has hardcoded values for font-size, line-height, headings, and max-width that you'd have to override almost entirely. The overrides are verbose and fragile.

**Recommendation: skip `prose` entirely.** Use custom component overrides in ReactMarkdown instead.

### Complete markdownComponents Override

> **Margin collapse doesn't exist in React/flexbox.** All spacing must be explicit margin-top values on each block element.

```tsx
// All spacing uses margin-top only — the "element below owns its gap" rule.
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className='text-chat-text mt-10 mb-2 text-[22px] leading-[1.4] font-semibold tracking-[-0.02em] first:mt-0'>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className='text-chat-text mt-8 mb-2 text-[18px] leading-[1.4] font-semibold tracking-[-0.015em] first:mt-0'>
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p className='text-chat-body mt-4 text-[14px] leading-[1.667] font-[420] first:mt-0'>{children}</p>
  ),
  ul: ({ children }) => (
    <ul className='text-chat-body mt-3 list-disc pl-5 text-[14px] leading-[1.667] font-[420]'>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className='text-chat-body mt-3 list-decimal pl-5 text-[14px] leading-[1.667] font-[420]'>{children}</ol>
  ),
  li: ({ children }) => <li className='mt-2 first:mt-0'>{children}</li>,
  code: ({ inline, className, children }) => {
    if (inline) {
      return (
        <code className='text-chat-inline bg-chat-inline-bg rounded-[3px] px-1 py-0.5 font-mono text-[12px] font-normal'>
          {children}
        </code>
      );
    }
    const language = className?.replace('language-', '') ?? 'text';
    return <CodeBlock language={language}>{String(children)}</CodeBlock>;
  },
  hr: () => <hr className='bg-chat-border mt-8 mb-8 h-px border-none' />,
  strong: ({ children }) => <strong className='text-chat-text font-semibold'>{children}</strong>,
};
```

---

## 6. Spacing Contract

All values are **margin-top only**. The element below always owns its top gap. No margin-bottom on block elements (except headings which use mb-2 for the heading→content gap).

### The Collision Rule

When two blocks meet, use the **larger** of the two margins. Never add them. In flex containers, CSS margin collapse does not occur — adjacent margins add up. Use margins on children and reset gap to 0.

### Complete Margin Table

| From → To                        | Gap  | Who owns it                      | Tailwind     |
| -------------------------------- | ---- | -------------------------------- | ------------ |
| Heading → content directly below | 8px  | heading (mb-2) or content (mt-2) | `mt-2`       |
| Body → Body                      | 16px | second paragraph                 | `mt-4`       |
| Body → H1                        | 40px | H1                               | `mt-10`      |
| Body → H2                        | 32px | H2                               | `mt-8`       |
| Body → List                      | 12px | list                             | `mt-3`       |
| Body → Code Block                | 20px | code block                       | `mt-5`       |
| Body → Table                     | 20px | table                            | `mt-5`       |
| List → Body                      | 12px | paragraph                        | `mt-3`       |
| List → Code / Table              | 20px | code/table (larger wins)         | `mt-5`       |
| Code → Body                      | 20px | paragraph after code             | `mt-5`       |
| Code → Code                      | 16px | second code block                | `mt-4`       |
| Divider (above and below)        | 32px | divider owns both sides          | `my-8`       |
| First element in message         | 0    | always — use first:mt-0          | `first:mt-0` |

---

## 7. Code Block Implementation

### CodeBlock Component

```tsx
interface CodeBlockProps {
  language: string;
  children: string;
}

function CodeBlock({ language, children }: CodeBlockProps) {
  return (
    <div className='border-chat-border mt-5 overflow-hidden rounded-lg border first:mt-0'>
      {/* Header — language label */}
      <div className='border-chat-border text-chat-secondary border-b bg-[#F3F1EE] px-4 py-1.5 font-mono text-[11px] font-medium tracking-normal'>
        {language}
      </div>
      {/* Code body */}
      <pre className='bg-chat-code-bg m-0 overflow-x-auto px-5 py-4'>
        <code className='text-chat-text font-mono text-[13px] leading-[1.5] font-normal'>{children.trimEnd()}</code>
      </pre>
    </div>
  );
}
```

### Syntax Highlighting

The codebase uses `lowlight` (hast-based, client-side). Keep using it — it works well for streaming contexts where server-side rendering isn't possible.

---

## 8. Table Rendering

Tables need custom overflow handling and the same 20px external margin as code blocks.

```tsx
table: ({ children }) => (
  <div className="mt-5 first:mt-0 overflow-x-auto">
    <table className="w-full border-collapse text-[13px] font-[420] text-chat-body">
      {children}
    </table>
  </div>
),
th: ({ children }) => (
  <th className="text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-chat-secondary pb-2 pr-4 pt-1 border-b-2 border-chat-border">
    {children}
  </th>
),
td: ({ children }) => (
  <td className="py-2.5 pr-4 border-b border-[#F0EEEB] text-chat-body leading-[1.5]">
    {children}
  </td>
),
```

> Table header top padding is 4px, not 8px. This keeps visual distance from preceding body text equal to the code block's perceived start.

---

## 9. Streaming Messages

| Concern                   | Recommendation                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Syntax highlighting       | Do not highlight while streaming — incomplete code blocks cause parser errors. Apply after stream ends.                       |
| Line-height during stream | Do not change between streaming and complete states. Use 1.667 from character one.                                            |
| Font weight during stream | Same — weight 420 from the start. No flash to 400 while loading.                                                              |
| Incomplete markdown       | react-markdown handles partial markdown gracefully. Unclosed code fences render as inline code — acceptable during streaming. |
| Max-width during stream   | Set max-width on the container before content arrives. Prevents width jumping as text reflows.                                |

---

## 10. Decision Log

| Decision                           | Rationale                                                                                        | Alternative considered                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| 14px base, not 16px                | Chat responses are message-thread density, not document density.                                 | 16px — rejected, feels like a text editor         |
| Weight 420 for body                | At 14px on white, 400 is optically too light. 500 is too heavy.                                  | 400 — too light. 500 — too heavy for body.        |
| 1.667 body line-height             | Dense multi-paragraph chat responses need 24px of space per line at 14px. 1.5 = 21px, too tight. | 1.5 — too tight for dense prose at 14px           |
| Heading LH 1.4, not 1.667          | Headings rarely wrap. Tight line-height makes them read as a label unit.                         | Uniform 1.667 — wrong, headings aren't paragraphs |
| 620px prose max-width              | At 14px Inter, 620px = ~65–70 characters per line. Optimal reading range.                        | 680px — too wide, ~80 chars/line                  |
| 4px grid, not 8px                  | Body→List gap is 12px (3 units). Body→Code is 20px (5 units). These don't land on an 8px grid.   | 8px grid — can't hit 12px or 20px cleanly         |
| Inline code: #9B4A6B not #B84B6F   | Saturated pink creates visual noise in paragraphs with multiple code references.                 | #B84B6F — too saturated, strobes                  |
| No Tailwind prose class            | Would require overriding ~20 CSS properties. Custom ReactMarkdown components are more explicit.  | prose + overrides — too much conflict             |
| No H1 inside chat responses        | H1 is reserved for page-level titles. Chat messages are fragments, not documents.                | Allow H1 — creates hierarchy confusion            |
| Code label: lowercase, no tracking | Modern UI uses lowercase for technical labels (VS Code, GitHub, Vercel).                         | UPPERCASE with tracking — dated, noisy            |
