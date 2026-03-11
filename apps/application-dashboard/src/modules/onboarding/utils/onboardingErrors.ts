import { BACKEND_ERRORS, ERROR_MESSAGES } from 'modules/onboarding/onboarding.constants';

type ApiError = {
  status: number;
  data?: { detail?: string };
};

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'status' in error;

/**
 * Handle common onboarding API errors:
 * - 400 "Expected status..." → wrong step, re-fetch session
 * - 400 other → validation error, show message
 * - 403 flag off → bypass onboarding, redirect to app
 * - 403 other → permission error, show message
 * - 409 → CAS conflict, re-fetch session
 * - 404 / other → unhandled, caller shows generic error
 *
 * Returns `true` if the error was handled (caller should return early).
 * Returns `false` if unhandled (caller should show a generic error).
 */
export const handleOnboardingApiError = (
  error: unknown,
  opts: {
    setError: (msg: string) => void;
    onWrongStep: () => void;
    onFlagDisabled: () => void;
  },
): boolean => {
  if (!isApiError(error)) return false;

  if (error.status === 403) {
    if (error.data?.detail === BACKEND_ERRORS.FLAG_OFF_MESSAGE) {
      opts.onFlagDisabled();
    } else {
      opts.setError(error.data?.detail || ERROR_MESSAGES.PERMISSION_DENIED);
    }

    return true;
  }

  if (error.status === 400) {
    const detail = error.data?.detail || '';

    if (
      detail.startsWith(BACKEND_ERRORS.WRONG_STEP_PREFIX) ||
      BACKEND_ERRORS.WRONG_STEP_REQUIRED_PATTERN.test(detail)
    ) {
      opts.onWrongStep();
    } else {
      opts.setError(detail || ERROR_MESSAGES.INVALID_REQUEST);
    }

    return true;
  }

  if (error.status === 409) {
    opts.onWrongStep();

    return true;
  }

  return false;
};
