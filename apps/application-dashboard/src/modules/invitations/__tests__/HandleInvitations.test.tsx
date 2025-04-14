import { render, screen, waitFor } from '@testing-library/react';
import { useLazyWhoAmIQuery } from 'apis/auth';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from 'apis/people';
import { ROUTES_PATH } from 'constants/routeConfig';
import { HandleInvitations } from 'modules/invitations/HandleInvitations';
import { useRouter } from 'next/router';

// Mock the required modules
jest.mock('next/font/google', () => ({
  Inter: () => ({
    style: {
      fontFamily: 'Inter',
    },
  }),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('apis/people', () => ({
  useGetMyInvitationsQuery: jest.fn(),
  useAcceptInvitationMutation: jest.fn(),
}));

jest.mock('apis/auth', () => ({
  useLazyWhoAmIQuery: jest.fn(),
}));

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

jest.mock('components/DynamicLottiePlayer', () => ({
  __esModule: true,
  default: () => <div data-testid='mocked-lottie-player' />,
}));

describe('HandleInvitations', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockInvitations = {
    invitations: [
      { organization_invitation_id: 'inv1', email: 'test1@example.com' },
      { organization_invitation_id: 'inv2', email: 'test2@example.com' },
    ],
  };

  const mockAcceptInvitation = jest.fn();
  const mockWhoAmI = jest.fn().mockResolvedValue({}); // returns a Promise that resolves with empty object

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useGetMyInvitationsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    (useAcceptInvitationMutation as jest.Mock).mockReturnValue([mockAcceptInvitation, { isLoading: false }]);
    (useLazyWhoAmIQuery as jest.Mock).mockReturnValue([mockWhoAmI, { isLoading: false }]);
  });
  const testCases = [
    {
      name: 'should show loading state initially',
      skip: false,
      setup: () => {},
      assertions: () => {
        expect(screen.getByTestId('handle-invitations-wrapper')).toBeInTheDocument();
      },
    },
    {
      name: 'should accept invitations, fetch user info and redirect to home when data is loaded',
      skip: false,
      setup: () => {
        (useGetMyInvitationsQuery as jest.Mock).mockReturnValue({
          data: mockInvitations,
          isLoading: false,
        });
      },
      assertions: async () => {
        await waitFor(() => {
          expect(mockAcceptInvitation).toHaveBeenCalledTimes(2);
          expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv1' });
          expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv2' });
          expect(mockWhoAmI).toHaveBeenCalled();
          expect(mockRouter.push).toHaveBeenCalledWith(ROUTES_PATH.HOME);
        });
      },
    },
    {
      name: 'should handle invitation acceptance errors gracefully',
      skip: false,
      setup: () => {
        const mockError = new Error('Accept invitation failed');

        mockAcceptInvitation.mockRejectedValueOnce(mockError);
        (useGetMyInvitationsQuery as jest.Mock).mockReturnValue({
          data: mockInvitations,
          isLoading: false,
        });
      },
      assertions: async () => {
        await waitFor(() => {
          expect(mockAcceptInvitation).toHaveBeenCalledTimes(2);
          expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv1' });
          expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv2' });
          expect(mockWhoAmI).toHaveBeenCalled();
          expect(mockRouter.push).toHaveBeenCalledWith(ROUTES_PATH.HOME);
        });
      },
    },
  ];

  testCases.forEach(({ name, skip, setup, assertions }) => {
    if (skip) {
      it.skip(name, async () => {
        setup();
        render(<HandleInvitations />);
        await assertions();
      });
    } else {
      it(name, async () => {
        setup();
        render(<HandleInvitations />);
        await assertions();
      });
    }
  });
});
