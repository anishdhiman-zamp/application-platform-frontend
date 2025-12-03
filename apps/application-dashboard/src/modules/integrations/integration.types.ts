export interface IntegrationType {
  id: string;
  display_name: string;
  logo: string;
  what_possible: string[];
  guide: string;
}

export interface IntegrationsDataType {
  version: number;
  integrations: IntegrationType[];
}
