import { createElement } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginButton from 'modules/login/LoginButton';
import '@testing-library/jest-dom';

jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'mocked-inter',
    variable: '--font-inter',
  })),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => createElement('img', { ...props, alt: props.alt || '' }),
}));

jest.mock('utils/common', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('LoginButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('should render login button with default text', () => {
    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }));

    const button = screen.getByRole('button');

    expect(button).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }));

    const button = screen.getByRole('button');

    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct cursor style when not loading', () => {
    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }));

    const button = screen.getByRole('button');

    expect(button).toHaveClass('cursor-pointer!');
  });

  it('should have correct cursor style when loading', () => {
    render(createElement(LoginButton, { loading: true, onClick: mockOnClick, providerLogo: '' }));

    const button = screen.getByRole('button');

    expect(button).toHaveClass('cursor-not-allowed!');
  });

  it('should show provider logo when loaded', async () => {
    const providerLogo = 'https://example.com/logo.png';

    Object.defineProperty(window, 'Image', {
      value: class MockImage {
        onload: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        }
      },
      writable: true,
    });

    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo }));

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Signing in with')).toBeInTheDocument();
      expect(screen.getByAltText('provider logo')).toBeInTheDocument();
    });
  });

  it('should not show provider logo when providerLogo is empty', () => {
    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }));

    expect(screen.queryByText('Signing in with')).not.toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should handle provider logo loading with delay', async () => {
    const providerLogo = 'https://example.com/logo.png';
    let imageOnLoad: (() => void) | null = null;

    Object.defineProperty(window, 'Image', {
      value: class MockImage {
        onload: (() => void) | null = null;
        src = '';

        constructor() {
          imageOnLoad = () => {
            if (this.onload) {
              this.onload();
            }
          };
        }
      },
      writable: true,
    });

    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo }));

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Signing in with')).not.toBeInTheDocument();

    if (imageOnLoad) {
      (imageOnLoad as () => void)();
    }

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Signing in with')).toBeInTheDocument();
    });
  });

  it('should reset logo loaded state when providerLogo changes to empty', () => {
    const { rerender } = render(
      createElement(LoginButton, {
        loading: false,
        onClick: mockOnClick,
        providerLogo: 'https://example.com/logo.png',
      }),
    );

    rerender(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }));

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Signing in with')).not.toBeInTheDocument();
  });

  it('should handle provider logo change', async () => {
    const firstLogo = 'https://example.com/logo1.png';
    const secondLogo = 'https://example.com/logo2.png';

    Object.defineProperty(window, 'Image', {
      value: class MockImage {
        onload: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        }
      },
      writable: true,
    });

    const { rerender } = render(
      createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: firstLogo }),
    );

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Signing in with')).toBeInTheDocument();
    });

    rerender(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: secondLogo }));

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Signing in with')).toBeInTheDocument();
    });
  });

  it('should have correct button id', () => {
    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }));

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('id', 'google-login');
  });

  it('should have correct button type', () => {
    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }));

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should apply loading class when loading is true', () => {
    render(createElement(LoginButton, { loading: true, onClick: mockOnClick, providerLogo: '' }));

    const button = screen.getByRole('button');

    expect(button).toHaveClass('cursor-not-allowed!');
  });

  it('should not apply loading class when loading is false', () => {
    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }));

    const button = screen.getByRole('button');

    expect(button).toHaveClass('cursor-pointer!');
  });

  it('should render provider logo with correct attributes', async () => {
    const providerLogo = 'https://example.com/logo.png';

    Object.defineProperty(window, 'Image', {
      value: class MockImage {
        onload: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        }
      },
      writable: true,
    });

    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo }));

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      const logoImage = screen.getByAltText('provider logo');

      expect(logoImage).toHaveAttribute('src', providerLogo);
      expect(logoImage).toHaveAttribute('width', '40');
      expect(logoImage).toHaveAttribute('height', '20');
    });
  });

  it('should handle image loading failure gracefully', () => {
    const providerLogo = 'https://example.com/invalid-logo.png';

    Object.defineProperty(window, 'Image', {
      value: class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      },
      writable: true,
    });

    render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo }));

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Signing in with')).not.toBeInTheDocument();
  });

  it('should match snapshot for default state', () => {
    const { container } = render(
      createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo: '' }),
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot for loading state', () => {
    const { container } = render(createElement(LoginButton, { loading: true, onClick: mockOnClick, providerLogo: '' }));

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with provider logo', async () => {
    const providerLogo = 'https://example.com/logo.png';

    Object.defineProperty(window, 'Image', {
      value: class MockImage {
        onload: (() => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onload) {
              this.onload();
            }
          }, 0);
        }
      },
      writable: true,
    });

    const { container } = render(createElement(LoginButton, { loading: false, onClick: mockOnClick, providerLogo }));

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Signing in with')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
