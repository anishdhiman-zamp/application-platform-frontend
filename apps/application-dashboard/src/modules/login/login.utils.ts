import { LOGIN_METHODS } from 'constants/auth.constants';
import {
  EXPIRY_TYPE,
  INVALID_CODE_MESSAGE_IDS,
  LOGIN_GROUPS,
  RESEND_SUCCESS_MESSAGE_IDS,
} from 'modules/login/login.constants';
import { FlowNode, FlowUiMessage, LoginFlow } from 'types/api/auth.types';
import { ROUTES_PATH } from '@/constants/routeConfig';

type NestedRecord = Record<string, unknown>;

function setNestedValue(obj: NestedRecord, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;

  const target = keys.reduce<NestedRecord>((current, key) => {
    current[key] = (current[key] as NestedRecord) || {};

    return current[key] as NestedRecord;
  }, obj);

  target[lastKey] = value;
}

/**
 * Extracts all hidden node values from a Kratos flow response (excluding csrf_token and method).
 * Handles dotted key names like "traits.email" -> { traits: { email: "..." } }.
 */
export function collectHiddenNodeValues(nodes: FlowNode[]): NestedRecord {
  const values: NestedRecord = {};

  for (const node of nodes) {
    const { name, type, value } = node.attributes;

    if (type === 'hidden' && name !== 'csrf_token' && name !== 'method' && value != null) {
      setNestedValue(values, name, value);
    }
  }

  return values;
}

export function getCsrfToken(nodes: FlowNode[]): string {
  return nodes.find((n) => n.attributes.name === 'csrf_token')?.attributes.value ?? '';
}

/**
 * Ensures the action URL uses the same origin as the API base that created the flow.
 * This prevents CSRF mismatch when the flow's action points to a different host (e.g. central
 * api.zamp.ai) but the flow was created on a regional host (e.g. api-us.zamp.ai) that set the cookie.
 */
export function actionUrlWithOrigin(actionUrl: string, apiBaseUrl: string | undefined): string {
  if (!apiBaseUrl) return actionUrl;
  try {
    const action = new URL(actionUrl);
    const base = new URL(apiBaseUrl);

    if (action.origin !== base.origin) {
      return new URL(action.pathname + action.search, base.origin).toString();
    }

    return actionUrl;
  } catch {
    return actionUrl;
  }
}

export function buildOtpSubmitBody(code: string, nodes: FlowNode[]): Record<string, unknown> {
  return {
    method: LOGIN_METHODS.CODE,
    code,
    csrf_token: getCsrfToken(nodes),
    ...collectHiddenNodeValues(nodes),
  };
}

export function buildResendBody(nodes: FlowNode[]): Record<string, unknown> {
  return {
    method: LOGIN_METHODS.CODE,
    resend: 'code',
    csrf_token: getCsrfToken(nodes),
    ...collectHiddenNodeValues(nodes),
  };
}

export function determineExpiryType(responseExpiredAt: string, flowExpiresAt: string): EXPIRY_TYPE {
  const respTime = new Date(responseExpiredAt).getTime();
  const flowTime = new Date(flowExpiresAt).getTime();

  if (isNaN(respTime) || isNaN(flowTime)) return EXPIRY_TYPE.UNKNOWN;

  return respTime < flowTime ? EXPIRY_TYPE.CODE_EXPIRED : EXPIRY_TYPE.FLOW_EXPIRED;
}

export function isInvalidCodeResponse(messages?: FlowUiMessage[]): boolean {
  return messages?.some((m) => INVALID_CODE_MESSAGE_IDS.includes(m.id)) ?? false;
}

export function isResendSuccessResponse(data: { state?: string; ui?: { messages?: FlowUiMessage[] } }): boolean {
  return (
    data.state === 'sent_email' ||
    (data.ui?.messages?.some((m) => m.type === 'info' && RESEND_SUCCESS_MESSAGE_IDS.includes(m.id)) ?? false)
  );
}

export function processPastedOtp(
  digits: string[],
  pasteText: string,
  startIndex: number,
  otpLength: number,
): { newDigits: string[]; nextFocusIndex: number } | null {
  const pasted = pasteText.replace(/[^0-9]/g, '');

  if (!pasted) return null;

  const newDigits = [...digits];

  for (const [offset, char] of [...pasted].entries()) {
    const targetIdx = startIndex + offset;

    if (targetIdx >= otpLength) break;
    newDigits[targetIdx] = char;
  }

  const nextFocusIndex = Math.min(startIndex + pasted.length, otpLength - 1);

  return { newDigits, nextFocusIndex };
}

export function flowHasCodeNodes(flow: LoginFlow): boolean {
  return flow.ui?.nodes?.some((n: FlowNode) => n.group === LOGIN_GROUPS.CODE) ?? false;
}

export function flowHasPasswordNodes(flow: LoginFlow): boolean {
  return flow.ui?.nodes?.some((n: FlowNode) => n.group === LOGIN_GROUPS.PASSWORD) ?? false;
}

/**
 * Redirects to dashboard by removing /login from the URL
 */
export function redirectToDashboard(): void {
  const currentPath = window.location.pathname;
  const dashboardPath = currentPath.replace(ROUTES_PATH.LOGIN, ROUTES_PATH.HOME) || ROUTES_PATH.HOME;

  window.location.href = dashboardPath;
}
