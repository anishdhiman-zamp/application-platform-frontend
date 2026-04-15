import type { CredentialKeyType, CredentialType } from '@/modules/credentials-vault/types/credentials-vault.types';

/** Creates a blank credential key with a unique ID. */
export const createEmptyKey = (): CredentialKeyType => ({
  id: crypto.randomUUID(),
  keyName: '',
  keyValue: '',
});

/** Creates a blank credential with one empty key row, ready for the add dialog. */
export const createEmptyCredential = (): CredentialType => ({
  id: '',
  name: '',
  keys: [createEmptyKey()],
});

/** Returns true when the draft has a name and at least one fully filled key pair. */
export const canSaveCredential = (draft: CredentialType): boolean =>
  !!draft.name.trim() && draft.keys.some((key) => key.keyName.trim() && key.keyValue.trim());
