import { render, screen } from '@testing-library/react';
import AgentInstructions from '@/modules/pace/components/agents/components/AgentInstructions';

const mockRefetch = jest.fn();
const mockUpdateInstructions = jest.fn();

jest.mock('@/apis/agents', () => ({
  useGetAgentInstructionsQuery: () => ({
    data: { content: 'Keep the daily checks tidy.' },
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  }),
  useUpdateAgentInstructionsMutation: () => [mockUpdateInstructions],
}));

jest.mock('@zamp-platform/ui', () => ({
  CSS_VARS: {
    GREEN_100: '#dcfce7',
    GREEN_800: '#166534',
    ORANGE_100: '#ffedd5',
    ORANGE_800: '#9a3412',
    RED_100: '#fee2e2',
    RED_800: '#991b1b',
  },
  COLORS: {
    BLACK: '#000000',
    WHITE: '#ffffff',
  },
  Skeleton: ({ className }: { className?: string }) => <div className={className} />,
}));

jest.mock('@/components/ImageKitImage', () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <span aria-label={alt} />,
}));

jest.mock('@/utils/clientOnly', () => ({
  clientOnly: () =>
    function MockMilkdownEditor({ content, className }: { content: string; className?: string }) {
      return (
        <div data-testid='milkdown-editor' className={className}>
          {content}
        </div>
      );
    },
}));

describe('AgentInstructions', () => {
  it('renders the instructions helper text as left-aligned secondary body copy', () => {
    render(<AgentInstructions agentId='agent-1' />);

    const helperText = screen.getByText('These instructions tell the agent what to do each time it runs.');

    expect(helperText).toHaveClass('f-14-400', 'text-GRAY_700', 'text-left', 'mb-6');
    ['f-14-450', 'text-GRAY_1000', 'ml-2.5', 'mt-4', 'my-4'].forEach((className) => {
      expect(helperText).not.toHaveClass(className);
    });
  });
});
