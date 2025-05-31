'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '@sentry/browser';
import { ErrorCardTypes } from '@/components/commonWrapper/commonWrapper.types';
import ErrorCard from '@/components/commonWrapper/ErrorCard';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class GracefullyDegradingErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, {
      extra: {
        errorInfo,
      },
    });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render the current HTML content without hydration
      return (
        <div suppressHydrationWarning className='flex justify-center items-center h-screen w-full'>
          <ErrorCard
            title='Something went wrong'
            className='w-full'
            subtitle='Please try again later'
            type={ErrorCardTypes.GENERAL_API_FAIL}
            onClose={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default GracefullyDegradingErrorBoundary;
