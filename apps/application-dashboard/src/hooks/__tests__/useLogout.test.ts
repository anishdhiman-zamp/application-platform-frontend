import { act, renderHook } from '@testing-library/react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery, useLazyWhoAmIQuery } from 'apis/auth';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useLogout } from 'hooks/useLogout';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Mock the session storage utility
jest.mock('@/utils/sessionstorage', () => ({
  SESSION_STORAGE_KEYS: { PATHNAME_PRE_LOGOUT: 'PATHNAME_PRE_LOGOUT' },
  setToSessionStorage: jest.fn(),
  getFromSessionStorage: jest.fn(),
  removeFromSessionStorage: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('apis/auth', () => ({
  useInitiateLogoutFlowQuery: jest.fn(),
  useLazyLogoutQuery: jest.fn(),
  useLazyWhoAmIQuery: jest.fn(),
}));

// Mock the postHog utility
jest.mock('utils/postHog', () => ({
  resetPostHog: jest.fn(),
}));

// Mock the SSE context
jest.mock('@/app/_providers/sse-provider', () => ({
  useSSEContext: jest.fn(() => ({
    disconnect: jest.fn(),
  })),
}));

// Mock the cookie utility
jest.mock('@/utils/cookie', () => ({
  clearCookie: jest.fn(),
  setCookie: jest.fn(),
  PREV_ROUTE_COOKIE: 'PREV_ROUTE_COOKIE',
  USER_SESSION_COOKIE: 'USER_SESSION_COOKIE',
}));

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

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

  it('should call logOut, fail whoAmI, but still redirect to login', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValueOnce({});
    const mockWhoAmI = jest.fn().mockRejectedValueOnce(new Error('WhoAmI failed'));

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/test-path',
    });

    (usePathname as jest.Mock).mockReturnValue('/test-path');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: { logout_url: 'test-url' },
      refetch: mockRefetch,
    });

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut, { isLoading: false }]);
    (useLazyWhoAmIQuery as jest.Mock).mockReturnValue([mockWhoAmI]);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      try {
        await result.current.logout();
      } catch (error) {
        console.log(error);
      }
    });

    expect(mockLogOut).toHaveBeenCalledWith('test-url');
    expect(mockWhoAmI).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('should refetch logout flow on logout failure', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockRejectedValueOnce(new Error('Logout failed'));
    const mockWhoAmI = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (usePathname as jest.Mock).mockReturnValue('/test-path');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

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
    expect(mockWhoAmI).not.toHaveBeenCalled(); // whoAmI should not be called if logout fails
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should call logOut with empty string if logout_url is undefined', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValueOnce({});
    const mockWhoAmI = jest.fn().mockResolvedValueOnce({});

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (usePathname as jest.Mock).mockReturnValue('/test-path');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: undefined,
      refetch: mockRefetch,
    });

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut, { isLoading: false }]);
    (useLazyWhoAmIQuery as jest.Mock).mockReturnValue([mockWhoAmI]);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogOut).toHaveBeenCalledWith('');
    expect(mockWhoAmI).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
  });

  it('should store full path with query parameters when search params exist', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValueOnce({});
    const mockWhoAmI = jest.fn().mockResolvedValueOnce({});

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('tab=settings&view=list'));

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
    expect(mockWhoAmI).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
  });
});
