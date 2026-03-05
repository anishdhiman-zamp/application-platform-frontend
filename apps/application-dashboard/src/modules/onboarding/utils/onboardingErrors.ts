const FLAG_OFF_MESSAGE = 'Onboarding flow is currently disabled';

type ApiError = {
  status: number;
  data?: { detail?: string };
};

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'status' in error;

/**
 * Handle common onboarding API errors per the spec:
 * - 400: wrong step → re-fetch session to get correct onboarding_status
 * - 403 flag off → silently redirect to main app
 * - 422: validation → show backend detail message
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

  if (error.status === 403 && error.data?.detail === FLAG_OFF_MESSAGE) {
    opts.onFlagDisabled();

    return true;
  }

  if (error.status === 400) {
    opts.onWrongStep();

    return true;
  }

  if (error.status === 422 && error.data?.detail) {
    opts.setError(error.data.detail);

    return true;
  }

  return false;
};
