import { FlowNode } from 'types/api/auth.types';

type NestedRecord = Record<string, unknown>;

function setNestedValue(obj: NestedRecord, path: string, value: unknown): void {
  const keys = path.split('.');
  let current: NestedRecord = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = (current[keys[i]] as NestedRecord) || {};
    current = current[keys[i]] as NestedRecord;
  }
  current[keys[keys.length - 1]] = value;
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
