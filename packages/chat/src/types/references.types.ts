export interface ReferenceKindDescriptor {
  kind: string;
  display_label: string;
  icon_hint: string;
  listing_mode?: string;
  aliases: string[];
}

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

export interface ReferencePickerAdapter {
  listKinds: () => Promise<ReferenceKindDescriptor[]>;
  listItems: (params: { kind: string; q?: string; limit?: number }) => Promise<{
    items: ReferenceSearchHit[];
    generation?: string;
  }>;
  listRecent?: () => ReferenceSearchHit[];
}

export interface ReferenceChip {
  kind: string;
  resource_id: string;
  display_label: string;
  provider_hints?: Record<string, unknown>;
}
