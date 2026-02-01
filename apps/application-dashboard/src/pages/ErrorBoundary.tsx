import { Component, Fragment, ReactNode } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { ErrorCardTypes } from '@/components/commonWrapper/commonWrapper.types';
import ErrorCard from '@/components/commonWrapper/ErrorCard';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorKey: number;
  errorCount: number;
  lastErrorTime: number;
}

// Max errors allowed in the time window before stopping recovery
const MAX_ERRORS = 3;
const ERROR_WINDOW_MS = 5000; // 5 seconds

/**
 * App-level error boundary that catches errors, shows a toast, and auto-recovers.
 * Instead of crashing the app, it:
 * 1. Shows a toast notification
 * 2. Attempts to re-render children (auto-recovery)
 * 3. Keeps the app running
 * 4. Stops recovering if too many errors happen (prevents infinite loops)
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private recoveryTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorKey: 0,
      errorCount: 0,
      lastErrorTime: 0,
    };
  }

  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const now = Date.now();
    const { errorCount, lastErrorTime } = this.state;

    // Reset error count if outside the time window
    const isInWindow = now - lastErrorTime < ERROR_WINDOW_MS;
    const newErrorCount = isInWindow ? errorCount + 1 : 1;

    // Log to Sentry
    captureException(error, {
      extra: { errorInfo, errorCount: newErrorCount },
    });
    console.error('ErrorBoundary caught:', { error, errorInfo });

    // Show toast notification
    toast.error('Something went wrong. Please try again.');

    // Check if we should stop recovering (too many errors)
    if (newErrorCount >= MAX_ERRORS) {
      console.error('ErrorBoundary: Too many errors, stopping auto-recovery');
      this.setState({
        errorCount: newErrorCount,
        lastErrorTime: now,
      });

      return;
    }

    // Auto-recover: reset error state after a brief delay
    this.setState({
      errorCount: newErrorCount,
      lastErrorTime: now,
    });

    // Clear any existing timeout before setting a new one
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }

    this.recoveryTimeout = setTimeout(() => {
      this.setState((prev) => ({
        hasError: false,
        errorKey: prev.errorKey + 1,
      }));
    }, 100);
  }

  render() {
    // If too many errors, show nothing for the failed component
    if (this.state.hasError && this.state.errorCount >= MAX_ERRORS) {
      return <ErrorCard type={ErrorCardTypes.GENERAL_API_FAIL} />;
    }

    // Use key to force re-mount children after error recovery
    return <Fragment key={this.state.errorKey}>{this.props.children}</Fragment>;
  }
}

export default ErrorBoundary;
