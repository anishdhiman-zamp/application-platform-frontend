import { Mark, mergeAttributes } from '@tiptap/core';

export const TextStyleWithBackground = Mark.create({
  name: 'textStyle',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          return attributes.color ? { style: `color: ${attributes.color}` } : {};
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          return attributes.backgroundColor ? { style: `background-color: ${attributes.backgroundColor}` } : {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[style]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },
});
