/**
 * @-mention reference picker types. Backend contract documented at
 * /home/coder/zamp/services/pantheon/claude_requests/references/frontend_spec.md
 */

export interface ReferenceKindDescriptor {
  kind: string;
  display_label: string;
  icon_hint: string;
  listing_mode?: string;
  aliases: string[];
}

export type ReferenceKindsResponse = ReferenceKindDescriptor[];

export interface ReferenceSearchHit {
  kind: string;
  resource_id: string;
  display_label: string;
  secondary_label?: string | null;
  icon_hint?: string | null;
  score?: number;
  mtime?: number | null;
  size_bytes?: number | null;
  provider_hints?: Record<string, unknown>;
}

export interface ReferenceListResponse {
  kind: string;
  generation: string;
  generated_at: number;
  items: ReferenceSearchHit[];
  truncated: boolean;
  total: number;
}

export interface ReferenceListRequest {
  kind: string;
  q?: string;
  limit?: number;
  if_none_match?: string;
}

/**
 * Structured reference attached to a chat message. Echoed back on submit and
 * received in history blocks of type `references`.
 */
export interface Reference {
  kind: string;
  resource_id: string;
  display_label?: string;
  provider_hints?: Record<string, unknown>;
  text_range?: [number, number] | null;
}
