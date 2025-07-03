import { act, renderHook } from '@testing-library/react';
import { getApiDomain } from '@zamp-platform/api';
import {
  useInitiateLogoutFlowQuery,
  useLazyInitiateLogoutFlowQuery,
  useLazyLogoutQuery,
  useLazyWhoAmIQuery,
} from 'apis/auth';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useAppSelector } from 'hooks/toolkit';
import { useLogout } from 'hooks/useLogout';
import { usePathname, useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('apis/auth', () => ({
  useInitiateLogoutFlowQuery: jest.fn(),
  useLazyInitiateLogoutFlowQuery: jest.fn(),
  useLazyLogoutQuery: jest.fn(),
  useLazyWhoAmIQuery: jest.fn(),
}));

jest.mock('hooks/toolkit', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('@zamp-platform/api', () => ({
  getApiDomain: jest.fn(),
  ENVIRONMENT: 'test',
}));

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAppSelector as jest.Mock).mockReturnValue({
      user: {
        organizations: [
          { id: 'org1', region: 'us' },
          { id: 'org2', region: 'eu' },
        ],
      },
    });

    (getApiDomain as jest.Mock).mockReturnValue('https://api.test.com');

    (useLazyInitiateLogoutFlowQuery as jest.Mock).mockReturnValue([
      jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({ logout_url: 'test-url' }),
      }),
      { isLoading: false },
    ]);
  });

  it('should call logOut, then whoAmI, and redirect to login on success', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValueOnce({});
    const mockWhoAmI = jest.fn().mockResolvedValueOnce({});

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/test-path',
    });

    (usePathname as jest.Mock).mockReturnValue('/test-path');

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: { logout_url: 'test-url' },
      refetch: mockRefetch,
    });

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut, { isLoading: false }]);
    (useLazyWhoAmIQuery as jest.Mock).mockReturnValue([mockWhoAmI]);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogOut).toHaveBeenCalledWith('test-url');
    expect(mockWhoAmI).toHaveBeenCalled(); // Ensure whoAmI is called
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('should call logOut and whoAmI successfully with multiple organizations', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValue({});
    const mockWhoAmI = jest.fn().mockResolvedValue({});

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/test-path',
    });

    (usePathname as jest.Mock).mockReturnValue('/test-path');

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: { logout_url: 'test-url' },
      refetch: mockRefetch,
    });

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut, { isLoading: false }]);
    (useLazyWhoAmIQuery as jest.Mock).mockReturnValue([mockWhoAmI]);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      result.current.logout();
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(mockLogOut).toHaveBeenCalledWith('test-url');
    expect(mockWhoAmI).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('should set and reset loading state during logout', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValue({});
    const mockWhoAmI = jest.fn().mockResolvedValue({});

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (usePathname as jest.Mock).mockReturnValue('/test-path');

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: { logout_url: 'test-url' },
      refetch: mockRefetch,
    });

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut, { isLoading: false }]);
    (useLazyWhoAmIQuery as jest.Mock).mockReturnValue([mockWhoAmI]);

    const { result } = renderHook(() => useLogout());

    expect(result.current.isLoggingOut).toBe(false);

    await act(async () => {
      result.current.logout();
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(mockLogOut).toHaveBeenCalledWith('test-url');
    expect(mockWhoAmI).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
  });

  it('should call logOut with empty string if logout_url is undefined', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValue({});
    const mockWhoAmI = jest.fn().mockResolvedValue({});

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (usePathname as jest.Mock).mockReturnValue('/test-path');

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: undefined,
      refetch: mockRefetch,
    });

    (useLazyInitiateLogoutFlowQuery as jest.Mock).mockReturnValue([
      jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({ logout_url: undefined }),
      }),
      { isLoading: false },
    ]);

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut, { isLoading: false }]);
    (useLazyWhoAmIQuery as jest.Mock).mockReturnValue([mockWhoAmI]);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockLogOut).toHaveBeenCalledWith('');
    expect(mockWhoAmI).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
  });
});
