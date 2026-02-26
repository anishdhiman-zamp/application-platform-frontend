import { LOGIN_METHODS } from 'constants/auth.constants';
import { INVALID_CODE_MESSAGE_IDS, RESEND_SUCCESS_MESSAGE_IDS } from 'modules/login/login.constants';
import { FlowNode, FlowUiMessage } from 'types/api/auth.types';

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

export function determineExpiryType(
  responseExpiredAt: string,
  flowExpiresAt: string,
): 'code_expired' | 'flow_expired' | 'unknown' {
  const respTime = new Date(responseExpiredAt).getTime();
  const flowTime = new Date(flowExpiresAt).getTime();

  if (isNaN(respTime) || isNaN(flowTime)) return 'unknown';

  return respTime < flowTime ? 'code_expired' : 'flow_expired';
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
