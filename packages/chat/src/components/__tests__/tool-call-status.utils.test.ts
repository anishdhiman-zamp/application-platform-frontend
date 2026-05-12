import { type Block, BLOCK_TYPE, type ToolResultContentBlock, type ToolUseContentBlock } from '../../types/block.types';
import { isToolCallInProgress } from '../tool-call-status.utils';

const toolUseBlock = (isComplete: boolean): ToolUseContentBlock => ({
  id: 'tool-use-1',
  type: BLOCK_TYPE.TOOL_USE,
  order: 0,
  is_complete: isComplete,
  payload: {
    tool_call_id: 'tool-call-1',
    display_name: 'Creating Hydration Reminder Agent',
  },
});

const toolResultBlock = (isComplete: boolean): ToolResultContentBlock => ({
  id: 'tool-result-1',
  type: BLOCK_TYPE.TOOL_RESULT,
  order: 1,
  is_complete: isComplete,
  payload: {
    content: '',
    is_error: false,
    tool_call_id: 'tool-call-1',
  },
});

const nextBlock: Block = {
  id: 'tool-use-2',
  type: BLOCK_TYPE.TOOL_USE,
  order: 2,
  is_complete: false,
  payload: {
    tool_call_id: 'tool-call-2',
    display_name: 'Checking Slack integration',
  },
};

describe('isToolCallInProgress', () => {
  it('keeps an earlier tool call active while its tool result is still running', () => {
    expect(
      isToolCallInProgress({
        toolUseBlock: toolUseBlock(true),
        toolResult: toolResultBlock(false),
        nextBlock,
        isStreaming: true,
      }),
    ).toBe(true);
  });

  it('keeps the newest streaming tool call active before a result block arrives', () => {
    expect(
      isToolCallInProgress({
        toolUseBlock: toolUseBlock(true),
        isStreaming: true,
      }),
    ).toBe(true);
  });

  it('marks older tool calls inactive once the call and result are complete', () => {
    expect(
      isToolCallInProgress({
        toolUseBlock: toolUseBlock(true),
        toolResult: toolResultBlock(true),
        nextBlock,
        isStreaming: true,
      }),
    ).toBe(false);
  });
});
