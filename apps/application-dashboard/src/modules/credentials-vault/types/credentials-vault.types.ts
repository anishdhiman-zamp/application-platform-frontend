import {
  CREDENTIAL_DIALOG_MODE,
  CREDENTIAL_KEY_FIELD,
} from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type { defaultFnType } from '@/types/commonTypes';

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

export interface CredentialKeyErrorsType {
  keyName?: string;
  keyValue?: string;
}

export interface CredentialDraftErrorsType {
  name?: string;
  keys: Record<string, CredentialKeyErrorsType>;
}

export interface CredentialDialogPropsType {
  mode: CredentialDialogModeType;
  credentialId?: string | null;
  onClose: defaultFnType;
}

export interface CredentialCardPropsType {
  credential: CredentialType;
  onManage: (credential: CredentialType) => void;
}

export interface CredentialRowPropsType {
  credentialKey: CredentialKeyType;
  isRevealed: boolean;
  isRevealing: boolean;
  isCopying: boolean;
  resolvedValue?: string;
  className?: string;
  onToggleReveal: (keyName: string) => void;
  onResolveValue: (keyName: string) => Promise<string>;
}
