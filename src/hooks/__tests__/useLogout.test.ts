import { act, renderHook } from '@testing-library/react';
import { useInitiateLogoutFlowQuery, useLazyLogoutQuery } from 'apis/auth';
import { ROUTES_PATH } from 'constants/routeConfig';
import { useLogout } from 'hooks/useLogout';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('apis/auth', () => ({
  useInitiateLogoutFlowQuery: jest.fn(),
  useLazyLogoutQuery: jest.fn(),
}));

describe('useLogout', () => {
  it('should call logOut with logout_url and redirect to login page on successful logout', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValueOnce({});

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: { logout_url: 'test-url' },
      refetch: mockRefetch,
    });

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut]);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogOut).toHaveBeenCalledWith('test-url');
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('should refetch logout flow on logout failure', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockRejectedValueOnce(new Error('Logout failed'));

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: { logout_url: 'test-url' },
      refetch: mockRefetch,
    });

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut]);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogOut).toHaveBeenCalledWith('test-url');
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should call logOut with empty string if logout_url is undefined', async () => {
    const mockPush = jest.fn();
    const mockRefetch = jest.fn();
    const mockLogOut = jest.fn().mockResolvedValueOnce({});

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useInitiateLogoutFlowQuery as jest.Mock).mockReturnValue({
      data: undefined,
      refetch: mockRefetch,
    });

    (useLazyLogoutQuery as jest.Mock).mockReturnValue([mockLogOut]);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogOut).toHaveBeenCalledWith('');
    expect(mockPush).toHaveBeenCalledWith(ROUTES_PATH.LOGIN);
  });
});
