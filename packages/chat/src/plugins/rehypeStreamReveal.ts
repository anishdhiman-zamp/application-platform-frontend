import type { Element, Root, RootContent, Text } from 'hast';

/** Tags whose text content should never be split into word spans.
 *  Includes elements produced by markdown delimiters (**, *, ~~, `, #, [])
 *  because the typewriter may slice mid-delimiter, causing flicker as the
 *  parser toggles between raw text and rendered HTML. */
const SKIP_TAGS = new Set([
  'code',
  'pre',
  'svg',
  'math',
  'script',
  'style',
  'strong',
  'em',
  'del',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
]);

/**
 * Rehype plugin that splits every text node into per-word `<span>` elements
 * with the class `stream-word`. During streaming, React's reconciliation
 * preserves already-mounted spans (keyed by position) so only newly appended
 * words trigger the CSS fade-in animation on mount.
 *
 * Skips code blocks, SVG, and math to avoid breaking their content.
 */
export function rehypeStreamReveal() {
  return (tree: Root) => {
    walkAndSplit(tree);
  };
}

function walkAndSplit(node: Root | Element): void {
  if (node.type === 'element' && SKIP_TAGS.has(node.tagName)) return;

  const newChildren: RootContent[] = [];

  for (const child of node.children) {
    if (child.type === 'text') {
      const words = splitIntoWords(child.value);
      for (const word of words) {
        if (word === '') continue;
        // Whitespace-only segments stay as plain text nodes (no span wrapper).
        if (word.trim() === '') {
          newChildren.push({ type: 'text', value: word } as Text);
        } else {
          const span: Element = {
            type: 'element',
            tagName: 'span',
            properties: { className: ['stream-word'] },
            children: [{ type: 'text', value: word } as Text],
          };
          newChildren.push(span);
        }
      }
    } else {
      if (child.type === 'element') {
        walkAndSplit(child);
      }
      newChildren.push(child);
    }
  }

  node.children = newChildren;
}

/**
 * Splits text into alternating segments of words and whitespace.
 * e.g. "hello world" → ["hello", " ", "world"]
 */
function splitIntoWords(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}
