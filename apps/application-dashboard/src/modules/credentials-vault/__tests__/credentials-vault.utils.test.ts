import { CREDENTIAL_VALIDATION_ERROR } from '@/modules/credentials-vault/constants/credentials-vault.constants';
import {
  createEmptyCredential,
  createEmptyKey,
  credentialKeysToBody,
  mapApiCredentialToUi,
  validateCredentialDraft,
} from '@/modules/credentials-vault/utils/credentials-vault.utils';
import type { CredentialResponseType } from '@/types/api/credentials.types';

const FIXED_UUID = '00000000-0000-0000-0000-000000000000';

beforeEach(() => {
  jest.spyOn(crypto, 'randomUUID').mockReturnValue(FIXED_UUID);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('createEmptyKey', () => {
  it('returns a key with empty name and value and a fresh id', () => {
    expect(createEmptyKey()).toEqual({
      id: FIXED_UUID,
      keyName: '',
      keyValue: '',
    });
  });
});

describe('createEmptyCredential', () => {
  it('returns a blank credential with exactly one empty key row', () => {
    const credential = createEmptyCredential();

    expect(credential.id).toBe('');
    expect(credential.name).toBe('');
    expect(credential.keys).toHaveLength(1);
    expect(credential.keys[0]).toMatchObject({ keyName: '', keyValue: '' });
  });
});

describe('validateCredentialDraft', () => {
  it('returns isValid=true and no errors when name and every key are filled', () => {
    const result = validateCredentialDraft({
      id: '',
      name: 'My key',
      keys: [{ id: '1', keyName: 'OPENAI_API_KEY', keyValue: 'sk-abc' }],
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({ keys: {} });
  });

  it('flags name when it is blank or whitespace only', () => {
    const result = validateCredentialDraft({
      id: '',
      name: '   ',
      keys: [{ id: '1', keyName: 'OPENAI_API_KEY', keyValue: 'sk-abc' }],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe(CREDENTIAL_VALIDATION_ERROR.NAME_REQUIRED);
    expect(result.errors.keys).toEqual({});
  });

  it('flags each empty key field per row independently', () => {
    const result = validateCredentialDraft({
      id: '',
      name: 'My key',
      keys: [
        { id: '1', keyName: '', keyValue: 'sk-abc' },
        { id: '2', keyName: 'STRIPE', keyValue: '' },
        { id: '3', keyName: '', keyValue: '' },
      ],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.keys).toEqual({
      '1': { keyName: CREDENTIAL_VALIDATION_ERROR.KEY_NAME_REQUIRED },
      '2': { keyValue: CREDENTIAL_VALIDATION_ERROR.KEY_VALUE_REQUIRED },
      '3': {
        keyName: CREDENTIAL_VALIDATION_ERROR.KEY_NAME_REQUIRED,
        keyValue: CREDENTIAL_VALIDATION_ERROR.KEY_VALUE_REQUIRED,
      },
    });
  });

  it('treats whitespace-only key name or value as blank', () => {
    const result = validateCredentialDraft({
      id: '',
      name: 'My key',
      keys: [{ id: '1', keyName: '  ', keyValue: '  ' }],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.keys['1']).toEqual({
      keyName: CREDENTIAL_VALIDATION_ERROR.KEY_NAME_REQUIRED,
      keyValue: CREDENTIAL_VALIDATION_ERROR.KEY_VALUE_REQUIRED,
    });
  });

  it('returns isValid=true when keys array is empty and name is filled', () => {
    const result = validateCredentialDraft({ id: '', name: 'My key', keys: [] });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({ keys: {} });
  });

  it('flags only the name when keys array is empty and name is blank', () => {
    const result = validateCredentialDraft({ id: '', name: '', keys: [] });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe(CREDENTIAL_VALIDATION_ERROR.NAME_REQUIRED);
    expect(result.errors.keys).toEqual({});
  });
});

describe('mapApiCredentialToUi', () => {
  const baseApiCredential: CredentialResponseType = {
    id: 'cred-1',
    name: 'My OpenAI Key',
    type: 'custom',
    description: null,
    credential_purpose: 'user_personal_creds',
    key_names: ['OPENAI_API_KEY', 'OPENAI_ORG_ID'],
    created_by: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    body: null,
  };

  it('produces empty key values when body is null (listing response)', () => {
    const ui = mapApiCredentialToUi(baseApiCredential);

    expect(ui).toEqual({
      id: 'cred-1',
      name: 'My OpenAI Key',
      keys: [
        { id: FIXED_UUID, keyName: 'OPENAI_API_KEY', keyValue: '' },
        { id: FIXED_UUID, keyName: 'OPENAI_ORG_ID', keyValue: '' },
      ],
    });
  });

  it('populates key values from body when decrypted (detail response)', () => {
    const ui = mapApiCredentialToUi({
      ...baseApiCredential,
      body: { OPENAI_API_KEY: 'sk-abc', OPENAI_ORG_ID: 'org-xyz' },
    });

    expect(ui.keys).toEqual([
      { id: FIXED_UUID, keyName: 'OPENAI_API_KEY', keyValue: 'sk-abc' },
      { id: FIXED_UUID, keyName: 'OPENAI_ORG_ID', keyValue: 'org-xyz' },
    ]);
  });

  it('falls back to body keys when key_names is empty', () => {
    const ui = mapApiCredentialToUi({
      ...baseApiCredential,
      key_names: [],
      body: { FOO: 'bar' },
    });

    expect(ui.keys).toEqual([{ id: FIXED_UUID, keyName: 'FOO', keyValue: 'bar' }]);
  });

  it('returns empty keys array when both key_names and body are empty', () => {
    const ui = mapApiCredentialToUi({ ...baseApiCredential, key_names: [], body: {} });

    expect(ui.keys).toEqual([]);
  });
});

describe('credentialKeysToBody', () => {
  it('returns an empty object when given an empty array', () => {
    expect(credentialKeysToBody([])).toEqual({});
  });

  it('returns an object keyed by keyName with corresponding values', () => {
    const result = credentialKeysToBody([
      { id: '1', keyName: 'OPENAI_API_KEY', keyValue: 'sk-abc' },
      { id: '2', keyName: 'STRIPE_KEY', keyValue: 'sk-live' },
    ]);

    expect(result).toEqual({
      OPENAI_API_KEY: 'sk-abc',
      STRIPE_KEY: 'sk-live',
    });
  });

  it('skips rows where keyName or keyValue is blank', () => {
    const result = credentialKeysToBody([
      { id: '1', keyName: '', keyValue: 'sk-abc' },
      { id: '2', keyName: 'OPENAI', keyValue: '' },
      { id: '3', keyName: 'STRIPE', keyValue: 'sk-live' },
    ]);

    expect(result).toEqual({ STRIPE: 'sk-live' });
  });

  it('trims whitespace from keyName and keyValue before storing', () => {
    const result = credentialKeysToBody([{ id: '1', keyName: '  OPENAI  ', keyValue: '  sk-abc  ' }]);

    expect(result).toEqual({ OPENAI: 'sk-abc' });
  });

  it('treats whitespace-only entries as empty and skips them', () => {
    const result = credentialKeysToBody([{ id: '1', keyName: '   ', keyValue: '   ' }]);

    expect(result).toEqual({});
  });

  it('later duplicate keys overwrite earlier ones', () => {
    const result = credentialKeysToBody([
      { id: '1', keyName: 'KEY', keyValue: 'first' },
      { id: '2', keyName: 'KEY', keyValue: 'second' },
    ]);

    expect(result).toEqual({ KEY: 'second' });
  });
});
