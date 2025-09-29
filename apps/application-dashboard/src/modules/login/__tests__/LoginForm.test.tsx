import React, { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getApiDomainAndRegions } from '@zamp-platform/api';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@zamp-platform/utils';
import { LoginForm } from 'modules/login/LoginForm';
import '@testing-library/jest-dom';

jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mocked-inter',
    variable: '--font-inter',
  })),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || ''} />,
}));

jest.mock('@zamp-platform/api', () => ({
  getApiDomainAndRegions: jest.fn(),
  REQUEST_TYPES: {
    POST: 'POST',
  },
  REGIONS_MAP: {
    us: {
      label: 'United States',
      suffix: '-us',
      shortHand: 'USA',
    },
    me: {
      label: 'Middle East',
      suffix: '-me',
      shortHand: 'ME',
    },
  },
}));

jest.mock('@zamp-platform/utils', () => ({
  getFromLocalStorage: jest.fn(),
  setToLocalStorage: jest.fn(),
  removeFromLocalStorage: jest.fn(),
  LOCAL_STORAGE_KEYS: {
    LAST_LOGGED_IN_OIDC_EMAIL: 'LAST_LOGGED_IN_OIDC_EMAIL',
    ORG_REGION: 'ORG_REGION_V5',
    ALL_REGIONS: 'ALL_REGIONS_V4',
  },
}));

jest.mock('utils/common', () => ({
  getDomainFromEmail: jest.fn(),
  isValidEmail: jest.fn(),
}));

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

jest.mock('modules/login/LocaldevEmailPasswordLogin', () => ({
  __esModule: true,
  default: () => createElement('div', { 'data-testid': 'localdev-login' }, 'LocaldevEmailPasswordLogin'),
}));

jest.mock('modules/login/LoginButton', () => ({
  __esModule: true,
  default: ({ loading, onClick }: any) =>
    createElement(
      'button',
      {
        'data-testid': 'login-button',
        onClick,
        disabled: loading,
      },
      loading ? 'Loading...' : 'Login',
    ),
}));

jest.mock('modules/login/RegionsSelectDropdown', () => ({
  __esModule: true,
  default: ({ regions }: any) =>
    createElement(
      'select',
      { 'data-testid': 'regions-dropdown' },
      regions.map((regionObj: any) =>
        createElement('option', { key: regionObj.region, value: regionObj.region }, regionObj.region),
      ),
    ),
}));

jest.mock('components/common/input', () => ({
  __esModule: true,
  default: ({ value, onChange, error, disabled, ...props }: any) =>
    createElement('input', {
      ...props,
      value,
      onChange,
      disabled,
      'data-error': error,
      'data-testid': 'email-input',
    }),
}));

global.fetch = jest.fn();

const mockLocation = {
  href: '',
  search: '',
  pathname: '',
  hash: '',
  host: '',
  hostname: '',
  port: '',
  protocol: '',
  origin: '',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
  configurable: true,
});

describe('LoginForm', () => {
  const mockGetApiDomainAndRegions = getApiDomainAndRegions as jest.Mock;
  const mockGetFromLocalStorage = getFromLocalStorage as jest.Mock;
  const mockSetToLocalStorage = setToLocalStorage as jest.Mock;
  const mockRemoveFromLocalStorage = removeFromLocalStorage as jest.Mock;
  const mockIsValidEmail = require('utils/common').isValidEmail as jest.Mock;
  const mockGetDomainFromEmail = require('utils/common').getDomainFromEmail as jest.Mock;
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFromLocalStorage.mockReturnValue('');
    mockGetApiDomainAndRegions.mockResolvedValue([{ region: 'us', url: 'https://api.zamp.ai' }]);
    mockIsValidEmail.mockReturnValue(true);
    mockGetDomainFromEmail.mockReturnValue('example.com');
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({}),
    });
    window.location.search = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('should render login form with email input', () => {
    render(createElement(LoginForm));

    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should initialize with email from localStorage', () => {
    const savedEmail = 'test@example.com';

    mockGetFromLocalStorage.mockReturnValue(savedEmail);

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    expect(emailInput).toHaveValue(savedEmail);
  });

  it('should handle email input changes', () => {
    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    expect(emailInput).toHaveValue('new@example.com');
  });

  it('should show error for invalid email on form submission', async () => {
    mockIsValidEmail.mockReturnValue(false);

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByTestId('email-input')).toHaveAttribute('data-error', expect.any(String));
    });
  });

  it('should show regions dropdown when multiple regions are available', async () => {
    mockGetApiDomainAndRegions.mockResolvedValue([
      { region: 'us', url: 'https://api-us.zamp.ai' },
      { region: 'me', url: 'https://api-me.zamp.ai' },
    ]);

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByTestId('regions-dropdown')).toBeInTheDocument();
    });
  });

  it('should proceed with login flow when email is valid and no regions', async () => {
    const mockLoginFlow = {
      ui: {
        nodes: [
          {
            group: 'oidc',
            attributes: {
              value: 'google',
              logo_url: 'https://example.com/logo.png',
            },
          },
        ],
        action: 'https://api.zamp.ai/auth/login',
        method: 'POST',
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockLoginFlow),
    });

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
        }),
      );
    });
  });

  it('should handle OIDC login initiation for single provider', async () => {
    const mockLoginFlow = {
      ui: {
        nodes: [
          {
            group: 'oidc',
            attributes: {
              value: 'google',
              logo_url: 'https://example.com/logo.png',
            },
          },
        ],
        action: 'https://api.zamp.ai/auth/oidc',
        method: 'POST',
      },
    };

    const mockOidcResponse = {
      redirect_browser_to: 'https://accounts.google.com/oauth/authorize?client_id=123',
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockLoginFlow),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockOidcResponse),
      });

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockSetToLocalStorage).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL,
        'test@example.com',
      );
    });
  });

  it('should handle redirect with domain parameter', async () => {
    const mockLoginFlow = {
      ui: {
        nodes: [
          {
            group: 'oidc',
            attributes: {
              value: 'google',
              logo_url: 'https://example.com/logo.png',
            },
          },
        ],
        action: 'https://api.zamp.ai/auth/oidc',
        method: 'POST',
      },
    };

    const mockOidcResponse = {
      redirect_browser_to: 'https://accounts.google.com/oauth/authorize?client_id=123',
    };

    mockGetDomainFromEmail.mockReturnValue('example.com');

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockLoginFlow),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockOidcResponse),
      });

    const originalLocation = window.location;

    delete (window as any).location;
    (window as any).location = { ...originalLocation, href: '' };

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockGetDomainFromEmail).toHaveBeenCalledWith('test@example.com');
    });

    (window as any).location = originalLocation;
  });

  it('should handle API errors during login flow', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        error: 'Invalid email',
      }),
    });

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockRemoveFromLocalStorage).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL);
    });
  });

  it('should handle OIDC errors with UI messages', async () => {
    const mockLoginFlow = {
      ui: {
        nodes: [
          {
            group: 'oidc',
            attributes: {
              value: 'google',
              logo_url: 'https://example.com/logo.png',
            },
          },
        ],
        action: 'https://api.zamp.ai/auth/oidc',
        method: 'POST',
      },
    };

    const mockErrorResponse = {
      ui: {
        messages: [
          {
            text: 'Authentication failed',
          },
        ],
      },
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockLoginFlow),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      });

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle valid session detected error', async () => {
    const mockLoginFlow = {
      ui: {
        nodes: [
          {
            group: 'oidc',
            attributes: {
              value: 'google',
              logo_url: 'https://example.com/logo.png',
            },
          },
        ],
        action: 'https://api.zamp.ai/auth/oidc',
        method: 'POST',
      },
    };

    const mockValidSessionResponse = {
      ui: {
        messages: [
          {
            text: 'Valid session detected',
          },
        ],
      },
      redirect_browser_to: 'https://app.zamp.ai/dashboard',
    };

    Object.defineProperty(window, 'location', {
      value: {
        href: '',
      },
      writable: true,
    });

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockLoginFlow),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockValidSessionResponse),
      });

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(
      () => {
        expect(mockSetToLocalStorage).toHaveBeenCalledWith(
          LOCAL_STORAGE_KEYS.LAST_LOGGED_IN_OIDC_EMAIL,
          'test@example.com',
        );
      },
      { timeout: 15000 },
    );
  });

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('should set region from URL parameters on mount', () => {
    window.location.search = '?region=me';
    mockGetFromLocalStorage.mockReturnValue('[]');

    render(createElement(LoginForm));

    expect(mockSetToLocalStorage).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.ORG_REGION, '-me');
  });

  it('should handle US region parameter correctly', () => {
    window.location.search = '?region=us';
    mockGetFromLocalStorage.mockReturnValue('[]');

    render(createElement(LoginForm));

    expect(mockSetToLocalStorage).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.ORG_REGION, '-us');
  });

  it('should handle JSON parsing errors for regions', () => {
    mockGetFromLocalStorage.mockReturnValue('invalid-json');

    render(createElement(LoginForm));

    expect(require('@sentry/nextjs').captureException).toHaveBeenCalled();
  });

  it('should render LocaldevEmailPasswordLogin for multiple login methods', async () => {
    const mockLoginFlow = {
      ui: {
        nodes: [
          {
            group: 'oidc',
            attributes: {
              value: 'google',
              logo_url: 'https://example.com/logo.png',
            },
          },
          {
            group: 'password',
            attributes: {
              name: 'password',
            },
          },
        ],
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockLoginFlow),
    });

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.queryByTestId('localdev-login')).toBeInTheDocument();
    });
  });

  it('should disable input when loading', () => {
    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    expect(emailInput).toBeDisabled();
  });

  it('should handle undefined email change event', () => {
    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: undefined } });

    expect(emailInput).toHaveValue('');
  });

  it('should handle redirect URL parsing errors', async () => {
    const mockLoginFlow = {
      ui: {
        nodes: [
          {
            group: 'oidc',
            attributes: {
              value: 'google',
              logo_url: 'https://example.com/logo.png',
            },
          },
        ],
        action: 'https://api.zamp.ai/auth/oidc',
        method: 'POST',
      },
    };

    const mockOidcResponse = {
      redirect_browser_to: 'invalid-url',
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockLoginFlow),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockOidcResponse),
      });

    render(createElement(LoginForm));

    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const form = emailInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
