export type ProcessesResponseType = {
  id: string;
  display_name: string;
  organization_id: string;
  metadata: MetadataType;
  process_type: string;
  fractional_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

type MetadataType = {
  sql_template: string;
  view_name: string;
};
