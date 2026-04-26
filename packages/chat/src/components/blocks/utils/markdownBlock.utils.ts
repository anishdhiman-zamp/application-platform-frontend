import type { Element, RootContent } from 'hast';
import { common, createLowlight } from 'lowlight';
import React, { Children, isValidElement, type ReactNode } from 'react';

import type { ReferenceRef } from '../../../types/block.types';
import { renderMentionChip } from '../MentionChipInline';

export type { ReferenceRef };

export type MentionMatcher = { regex: RegExp; byToken: Map<string, ReferenceRef> };

const lowlight = createLowlight(common);

/**
 * Recursively concatenate all text content from React children into a single
 * string. Walks through nested elements and extracts string/number leaves —
 * used to derive a plain-text representation from a JSX subtree.
 */
export const extractTextFromChildren = (children: ReactNode): string => {
  let text = '';
  Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      text += child;
    } else if (typeof child === 'number') {
      text += String(child);
    } else if (isValidElement(child)) {
      const childProps = child.props as { children?: ReactNode };
      if (childProps.children) {
        text += extractTextFromChildren(childProps.children);
      }
    }
  });
  return text;
};

/**
 * Convert a lowlight HAST node array into React elements. Preserves the
 * `hljs-*` class names lowlight emits so the existing syntax-highlight CSS
 * continues to paint tokens correctly.
 */
export const hastToReact = (nodes: RootContent[], keyPrefix = 'hl'): React.ReactNode[] => {
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      return node.value;
    }
    if (node.type === 'element') {
      const el = node as Element;
      const className = (el.properties?.className as string[])?.join(' ');
      return React.createElement(
        el.tagName,
        { key: `${keyPrefix}-${i}`, ...(className ? { className } : {}) },
        el.children ? hastToReact(el.children as RootContent[], `${keyPrefix}-${i}`) : null,
      );
    }
    return null;
  });
};

/**
 * Run lowlight syntax highlighting on a code string and return the resulting
 * React tree. Uses the explicit `language` when registered, otherwise falls
 * back to language auto-detection. Returns the raw code unchanged on error.
 */
export const highlightCode = (code: string, language?: string): React.ReactNode => {
  try {
    if (language && !lowlight.registered(language)) return code;

    const tree = language ? lowlight.highlight(language, code) : lowlight.highlightAuto(code);
    const children = tree.children as RootContent[];
    if (children.length === 0) return code;

    return hastToReact(children);
  } catch {
    return code;
  }
};

/** Escape a string for safe inclusion in a RegExp. */
const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build a matcher used by `wrapMentions` to swap `@label` occurrences with
 * chip components. Labels are sorted longest-first so overlapping labels
 * resolve to the longest match (e.g. `@report.pdf` wins over `@report`).
 * Returns `null` when there are no references — callers should short-circuit
 * to avoid unnecessary tree walks.
 */
export const buildMentionMatcher = (refs: ReferenceRef[]): MentionMatcher | null => {
  if (refs.length === 0) return null;
  const byToken = new Map<string, ReferenceRef>();
  for (const ref of refs) {
    const label = ref.display_label || ref.resource_id;
    byToken.set(`@${label}`, ref);
  }
  const tokens = Array.from(byToken.keys()).sort((a, b) => b.length - a.length);
  const pattern = tokens.map(escapeRegex).join('|');
  return { regex: new RegExp(pattern, 'g'), byToken };
};

/**
 * Walk a React subtree and replace every matched `@label` string with a
 * chip component. Runs after react-markdown has parsed and rendered the
 * text, so the underlying markdown AST stays stable across streaming
 * updates (no flash).
 *
 * String children are split at match boundaries into alternating text +
 * chip parts. Element children are cloned with recursively-processed
 * children so chips appear inside `<strong>`, `<em>`, `<li>`, etc.
 */
export const wrapMentions = (children: ReactNode, matcher: MentionMatcher | null, keyPrefix = 'm'): ReactNode => {
  if (!matcher) return children;
  return Children.map(children, (child, idx) => {
    if (typeof child === 'string') {
      const parts: ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      matcher.regex.lastIndex = 0;
      while ((match = matcher.regex.exec(child)) !== null) {
        if (match.index > lastIndex) parts.push(child.slice(lastIndex, match.index));
        const ref = matcher.byToken.get(match[0]);
        parts.push(renderMentionChip(ref, `${keyPrefix}-${idx}-${match.index}`));
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < child.length) parts.push(child.slice(lastIndex));
      return parts.length > 0 ? parts : child;
    }
    if (isValidElement(child)) {
      const childProps = child.props as { children?: ReactNode };
      if (childProps.children) {
        return React.cloneElement(child, undefined, wrapMentions(childProps.children, matcher, `${keyPrefix}-${idx}`));
      }
    }
    return child;
  });
};
