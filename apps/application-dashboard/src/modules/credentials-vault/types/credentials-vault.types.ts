import {
  CREDENTIAL_DIALOG_MODE,
  CREDENTIAL_KEY_FIELD,
} from '@/modules/credentials-vault/constants/credentials-vault.constants';

export type CredentialKeyFieldType = (typeof CREDENTIAL_KEY_FIELD)[keyof typeof CREDENTIAL_KEY_FIELD];

export interface CredentialKeyType {
  id: string;
  keyName: string;
  keyValue: string;
}

export interface CredentialType {
  id: string;
  name: string;
  keys: CredentialKeyType[];
}

export type CredentialDialogModeType = (typeof CREDENTIAL_DIALOG_MODE)[keyof typeof CREDENTIAL_DIALOG_MODE];

export interface CredentialDialogPropsType {
  mode: CredentialDialogModeType;
  credential?: CredentialType | null;
  onClose: () => void;
  onSave: (credential: CredentialType) => void;
  onDelete?: (credentialId: string) => void;
}

export interface CredentialCardPropsType {
  credential: CredentialType;
  onManage: (credential: CredentialType) => void;
}

export interface CredentialRowPropsType {
  credentialKey: CredentialKeyType;
  className?: string;
}
