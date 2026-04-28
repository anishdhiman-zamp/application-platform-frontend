import { CREDENTIAL_VALIDATION_ERROR } from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type {
  CredentialDraftErrorsType,
  CredentialKeyType,
  CredentialType,
} from '@/modules/credentials-vault/types/credentials-vault.types';
import type { CredentialResponseType } from '@/types/api/credentials.types';

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

/** Validates a credential draft and returns inline errors plus an overall validity flag. */
export const validateCredentialDraft = (
  draft: CredentialType,
): { errors: CredentialDraftErrorsType; isValid: boolean } => {
  const errors: CredentialDraftErrorsType = { keys: {} };

  if (!draft.name.trim()) {
    errors.name = CREDENTIAL_VALIDATION_ERROR.NAME_REQUIRED;
  }

  draft.keys.forEach((key) => {
    const keyErrors: { keyName?: string; keyValue?: string } = {};

    if (!key.keyName.trim()) keyErrors.keyName = CREDENTIAL_VALIDATION_ERROR.KEY_NAME_REQUIRED;
    if (!key.keyValue.trim()) keyErrors.keyValue = CREDENTIAL_VALIDATION_ERROR.KEY_VALUE_REQUIRED;

    if (keyErrors.keyName || keyErrors.keyValue) {
      errors.keys[key.id] = keyErrors;
    }
  });

  const isValid = !errors.name && Object.keys(errors.keys).length === 0;

  return { errors, isValid };
};

/** Maps an API credential into the UI credential shape used by cards/dialog. */
export const mapApiCredentialToUi = (apiCredential: CredentialResponseType): CredentialType => {
  const body = apiCredential.body ?? {};
  const keyNames = apiCredential.key_names?.length ? apiCredential.key_names : Object.keys(body);

  return {
    id: apiCredential.id,
    name: apiCredential.name,
    keys: keyNames.map((keyName) => ({
      id: crypto.randomUUID(),
      keyName,
      keyValue: body[keyName] ?? '',
    })),
  };
};

/** Filters out empty rows and produces the `body` map expected by create/update endpoints. */
export const credentialKeysToBody = (keys: CredentialKeyType[]): Record<string, string> =>
  keys.reduce<Record<string, string>>((acc, key) => {
    const trimmedName = key.keyName.trim();
    const trimmedValue = key.keyValue.trim();

    if (trimmedName && trimmedValue) acc[trimmedName] = trimmedValue;

    return acc;
  }, {});
