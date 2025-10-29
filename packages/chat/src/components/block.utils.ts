import { Block, BlockType } from '../types/block.types';

/**
 * Extracts initial values from blocks that support initial values
 * Currently supports:
 * - Single select (initial_value)
 *
 * Future support planned for:
 * - Dropdowns (initial_selection)
 * - Checkboxes (initial_checked)
 * - Text inputs (initial_value)
 */
export const extractInitialValues = (blocks: Block[]): Record<string, string> => {
  const initialValues: Record<string, string> = {};

  blocks.forEach((block) => {
    switch (block.type) {
      case BlockType.SINGLE_SELECT:
        if (block.payload.initial_value) {
          initialValues[block.id] = block.payload.initial_value;
        }
        break;

      default:
        break;
    }
  });

  return initialValues;
};
