import { render, screen, waitFor } from '@testing-library/react';
import { useLazyWhoAmIQuery } from 'apis/auth';
import { useAcceptInvitationMutation, useGetMyInvitationsQuery } from 'apis/people';
import { ROUTES_PATH } from 'constants/routeConfig';
import { HandleInvitations } from 'modules/invitations/HandleInvitations';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Mock the required modules
jest.mock('next/font/google', () => ({
  Inter: () => ({
    style: {
      fontFamily: 'Inter',
    },
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the session storage utility
jest.mock('@/utils/sessionstorage', () => ({
  SESSION_STORAGE_KEYS: { PATHNAME_PRE_LOGOUT: 'PATHNAME_PRE_LOGOUT' },
  setToSessionStorage: jest.fn(),
  getFromSessionStorage: jest.fn(),
  removeFromSessionStorage: jest.fn(),
}));

// Mock the postHog utility
jest.mock('utils/postHog', () => ({
  resetPostHog: jest.fn(),
}));

jest.mock('apis/people', () => ({
  useGetMyInvitationsQuery: jest.fn(),
  useAcceptInvitationMutation: jest.fn(),
}));

jest.mock('apis/auth', () => ({
  useLazyWhoAmIQuery: jest.fn(),
  useInitiateLogoutFlowQuery: jest.fn(),
  useLazyLogoutQuery: jest.fn(),
}));

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

jest.mock('@zamp-platform/utils', () => ({
  getFromLocalStorage: jest.fn(),
  LOCAL_STORAGE_KEYS: {
    ORG_REGION: 'ORG_REGION_V5',
    ALL_REGIONS: 'ALL_REGIONS_V4',
  },
}));

jest.mock('components/DynamicLottiePlayer', () => ({
  __esModule: true,
  default: () => <div data-testid='mocked-lottie-player' />,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('HandleInvitations', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSearchParams = new URLSearchParams('?region=us');

  const mockInvitations = {
    invitations: [
      { organization_invitation_id: 'inv1', email: 'test1@example.com' },
      { organization_invitation_id: 'inv2', email: 'test2@example.com' },
    ],
  };

  const mockAcceptInvitation = jest.fn().mockResolvedValue({}); // returns a Promise that resolves with empty object
  const mockWhoAmI = jest.fn().mockResolvedValue({}); // returns a Promise that resolves with empty object

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/test-path');
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useGetMyInvitationsQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    (useAcceptInvitationMutation as jest.Mock).mockReturnValue([mockAcceptInvitation, { isLoading: false }]);
    (useLazyWhoAmIQuery as jest.Mock).mockReturnValue([mockWhoAmI, { isLoading: false }]);

    const { useInitiateLogoutFlowQuery, useLazyLogoutQuery } = require('apis/auth');

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: { logout_url: 'http://logout.url' },
      refetch: jest.fn(),
    });
    (useLazyLogoutQuery as jest.Mock).mockReturnValue([jest.fn(), { isLoading: false }]);

    const { getFromLocalStorage } = require('@zamp-platform/utils');

    (getFromLocalStorage as jest.Mock).mockReturnValue('');

    delete (window as any).location;
    (window as any).location = {
      pathname: '/invitations',
      search: '?region=us',
      href: 'http://localhost:3000/invitations?region=us',
      origin: 'http://localhost:3000',
    };
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
        await waitFor(
          () => {
            expect(mockAcceptInvitation).toHaveBeenCalledTimes(2);
            expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv1' });
            expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv2' });
            expect(mockWhoAmI).toHaveBeenCalled();
            expect(mockRouter.push).toHaveBeenCalledWith(ROUTES_PATH.HOME);
          },
          { timeout: 5000 },
        );
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
        await waitFor(
          () => {
            expect(mockAcceptInvitation).toHaveBeenCalledTimes(2);
            expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv1' });
            expect(mockAcceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv2' });
            expect(mockWhoAmI).toHaveBeenCalled();
            expect(mockRouter.push).toHaveBeenCalledWith(ROUTES_PATH.HOME);
          },
          { timeout: 5000 },
        );
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
