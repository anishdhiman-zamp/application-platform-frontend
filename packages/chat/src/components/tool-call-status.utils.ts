import type { Block, ToolResultContentBlock, ToolUseContentBlock } from '../types/block.types';

interface ToolCallProgressArgs {
  toolUseBlock: ToolUseContentBlock;
  toolResult?: ToolResultContentBlock;
  nextBlock?: Block;
  isStreaming: boolean;
}

export const isToolCallInProgress = ({
  toolUseBlock,
  toolResult,
  nextBlock,
  isStreaming,
}: ToolCallProgressArgs): boolean => {
  return toolUseBlock.is_complete === false || toolResult?.is_complete === false || (!nextBlock && isStreaming);
};
