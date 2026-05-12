import { render, screen } from '@testing-library/react';

import { type Block, BLOCK_TYPE, TASK_STATUS } from '../../types/block.types';
import { BlockRenderer } from '../BlockRenderer';

jest.mock('@zamp-platform/ui', () => ({
  AnimatedDot: () => <span data-testid='animated-dot' />,
}));

jest.mock('@zamp-platform/ui/utils', () => ({
  cn: (...classes: unknown[]) =>
    classes
      .flatMap((className) => {
        if (!className) return [];
        if (typeof className === 'string') return [className];
        if (typeof className === 'object') {
          return Object.entries(className)
            .filter(([, value]) => Boolean(value))
            .map(([key]) => key);
        }

        return [];
      })
      .join(' '),
}));

jest.mock('../../context/ChatActionsContext', () => ({
  useChatActions: () => ({
    renderAgentBlock: (payload: { name: string }) => <div data-testid='agent-block'>{payload.name}</div>,
  }),
}));

jest.mock('../blocks', () => ({
  AgentBlock: () => <div data-testid='default-agent-block' />,
  ButtonBlock: () => <div data-testid='button-block' />,
  FileReferencesList: () => <div data-testid='file-references-list' />,
  InputsRespondedBlock: () => <div data-testid='inputs-responded-block' />,
  MarkdownBlock: () => <div data-testid='markdown-block' />,
  OutputFilesBlock: () => <div data-testid='output-files-block' />,
  PlainTextBlock: () => <div data-testid='plain-text-block' />,
  QuestionGroupBlock: () => <div data-testid='question-group-block' />,
  SingleSelectBlock: () => <div data-testid='single-select-block' />,
  TaskBlock: ({ className }: { className?: string }) => <div className={className} data-testid='task-block' />,
  ThinkingBlock: () => <div data-testid='thinking-block' />,
  ToolCallBlock: () => <div data-testid='tool-call-block' />,
}));

describe('BlockRenderer', () => {
  it('keeps adjacent agent and task cards compact', () => {
    const blocks: Block[] = [
      {
        id: 'agent-block-1',
        order: 1,
        type: BLOCK_TYPE.AGENT,
        payload: {
          agent_id: 'agent-1',
          name: 'Twitter Reader Agent',
          description: 'Reads Twitter',
          colour: '#111111',
          avatar: 'agent_1',
        },
      },
      {
        id: 'task-block-1',
        order: 2,
        type: BLOCK_TYPE.TASK,
        payload: {
          id: 'task-1',
          task_id: 'task-1',
          title: 'Write a markdown document',
          status: TASK_STATUS.IN_PROGRESS,
        },
      },
    ];

    render(<BlockRenderer message={{ block: blocks }} />);

    const agentWrapperClassName = screen.getByTestId('agent-block').parentElement?.className ?? '';
    const taskBlockClassName = screen.getByTestId('task-block').className;

    expect(agentWrapperClassName).toContain('pb-0');
    expect(agentWrapperClassName).not.toContain('pb-3');
    expect(taskBlockClassName).toContain('mt-2');
    expect(taskBlockClassName).toContain('mb-3');
  });
});
