import { defaultFnType } from '@/types/commonTypes';

export interface SecurityProviderType {
  id: string;
  label: string;
  icon: string;
}

export interface ConfiguredDomainType {
  id: string;
  value: string;
  enabled: boolean;
}

export interface ConfiguredProviderType {
  provider: SecurityProviderType;
  domains: ConfiguredDomainType[];
  metadataUrl: string;
}

export type AddModeType = {
  mode: 'add';
  provider: SecurityProviderType | null;
  onClose: defaultFnType;
  onBack: defaultFnType;
  onSetupComplete: (configured: ConfiguredProviderType) => void;
};

export type ManageModeType = {
  mode: 'manage';
  configuredProvider: ConfiguredProviderType | null;
  onClose: defaultFnType;
  onSave: (updated: ConfiguredProviderType) => void;
  onDisconnect: (providerId: string) => void;
};

export type ProviderCredentialsDialogPropsType = AddModeType | ManageModeType;

export interface SecurityProviderDialogPropsType {
  provider: SecurityProviderType | null;
  onClose: defaultFnType;
  onSetupComplete: (configured: ConfiguredProviderType) => void;
}
