import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@zamp-platform/ui';
import {
  useCreateCredentialMutation,
  useDeleteCredentialMutation,
  useGetCredentialQuery,
  useUpdateCredentialMutation,
} from '@/apis/credentials';
import {
  CREDENTIAL_DIALOG_MODE,
  CREDENTIAL_KEY_FIELD,
  CREDENTIAL_TOAST_MESSAGE,
  DEFAULT_CREDENTIAL_TYPE,
  DEFAULT_VAULT_CREDENTIAL_PURPOSE,
} from '@/modules/credentials-vault/constants/credentials-vault.constants';
import type {
  CredentialDialogModeType,
  CredentialDraftErrorsType,
  CredentialKeyFieldType,
  CredentialType,
} from '@/modules/credentials-vault/types/credentials-vault.types';
import {
  createEmptyCredential,
  createEmptyKey,
  credentialKeysToBody,
  mapApiCredentialToUi,
  validateCredentialDraft,
} from '@/modules/credentials-vault/utils/credentials-vault.utils';
import type { defaultFnType } from '@/types/commonTypes';

interface UseCredentialDialogParams {
  mode: CredentialDialogModeType;
  credentialId?: string | null;
  onClose: defaultFnType;
}

export const useCredentialDialog = ({ mode, credentialId, onClose }: UseCredentialDialogParams) => {
  const hasHydratedRef = useRef(false);

  const [lastAddedKeyId, setLastAddedKeyId] = useState<string | null>(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<CredentialDraftErrorsType>({ keys: {} });
  const [persistedKeyIds, setPersistedKeyIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<CredentialType>(() => createEmptyCredential());

  const isManage = mode === CREDENTIAL_DIALOG_MODE.MANAGE;
  const { data: apiCredential, isLoading: isFetching } = useGetCredentialQuery(
    { credential_id: credentialId ?? '', decrypt: true },
    { skip: !isManage || !credentialId },
  );
  const [createCredential, { isLoading: isCreating }] = useCreateCredentialMutation();
  const [updateCredential, { isLoading: isUpdating }] = useUpdateCredentialMutation();
  const [deleteCredential, { isLoading: isDeleting }] = useDeleteCredentialMutation();

  const isSaving = isCreating || isUpdating;

  const syncDraftWithCredential = useCallback(() => {
    if (!isManage || !apiCredential || hasHydratedRef.current) return;

    const mapped = mapApiCredentialToUi(apiCredential);

    setDraft(mapped);
    setPersistedKeyIds(new Set(mapped.keys.map((key) => key.id)));
    hasHydratedRef.current = true;
  }, [apiCredential, isManage]);

  const handleNameChange = useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, name: value }));
    setErrors((prev) => {
      if (!prev.name) return prev;

      return { ...prev, name: undefined };
    });
  }, []);

  const handleKeyChange = useCallback((id: string, field: CredentialKeyFieldType, value: string) => {
    setDraft((prev) => ({
      ...prev,
      keys: prev.keys.map((key) => (key.id === id ? { ...key, [field]: value } : key)),
    }));

    if (field === CREDENTIAL_KEY_FIELD.KEY_VALUE) {
      setPersistedKeyIds((prev) => {
        if (!prev.has(id)) return prev;

        const next = new Set(prev);

        next.delete(id);

        return next;
      });
    }

    setErrors((prev) => {
      const rowErrors = prev.keys[id];

      if (!rowErrors?.[field]) return prev;

      const { [field]: _, ...remaining } = rowErrors;
      const nextKeys = { ...prev.keys };

      if (Object.keys(remaining).length === 0) delete nextKeys[id];
      else nextKeys[id] = remaining;

      return { ...prev, keys: nextKeys };
    });
  }, []);

  const handleAddKey = useCallback(() => {
    const newKey = createEmptyKey();

    setDraft((prev) => ({ ...prev, keys: [...prev.keys, newKey] }));
    setLastAddedKeyId(newKey.id);
  }, []);

  const handleRemoveKey = useCallback((id: string) => {
    setDraft((prev) => {
      if (prev.keys.length <= 1) {
        return { ...prev, keys: [{ ...prev.keys[0], keyName: '', keyValue: '' }] };
      }

      return { ...prev, keys: prev.keys.filter((key) => key.id !== id) };
    });
    setPersistedKeyIds((prev) => {
      if (!prev.has(id)) return prev;

      const next = new Set(prev);

      next.delete(id);

      return next;
    });
    setErrors((prev) => {
      if (!prev.keys[id]) return prev;

      const nextKeys = { ...prev.keys };

      delete nextKeys[id];

      return { ...prev, keys: nextKeys };
    });
  }, []);

  const handleToggleReveal = useCallback((id: string) => {
    setRevealedKeyIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const { errors: validationErrors, isValid } = validateCredentialDraft(draft);

    if (!isValid) {
      setErrors(validationErrors);

      return;
    }

    setErrors({ keys: {} });

    const name = draft.name.trim();
    const body = credentialKeysToBody(draft.keys);

    const request =
      isManage && credentialId
        ? updateCredential({ credential_id: credentialId, name, body })
        : createCredential({
            name,
            body,
            type: DEFAULT_CREDENTIAL_TYPE,
            credential_purpose: DEFAULT_VAULT_CREDENTIAL_PURPOSE,
          });

    const successMessage = isManage ? CREDENTIAL_TOAST_MESSAGE.UPDATE_SUCCESS : CREDENTIAL_TOAST_MESSAGE.ADD_SUCCESS;
    const failureMessage = isManage ? CREDENTIAL_TOAST_MESSAGE.UPDATE_FAILURE : CREDENTIAL_TOAST_MESSAGE.ADD_FAILURE;

    request
      .unwrap()
      .then(() => {
        toast.success(successMessage);
        onClose();
      })
      .catch(() => {
        toast.error(failureMessage);
      });
  }, [createCredential, credentialId, draft, isManage, onClose, updateCredential]);

  const handleDelete = useCallback(() => {
    if (!isManage || !credentialId) return;

    deleteCredential(credentialId)
      .unwrap()
      .then(() => {
        toast.success(CREDENTIAL_TOAST_MESSAGE.DELETE_SUCCESS);
        onClose();
      })
      .catch(() => {
        toast.error(CREDENTIAL_TOAST_MESSAGE.DELETE_FAILURE);
      });
  }, [credentialId, deleteCredential, isManage, onClose]);

  useEffect(() => {
    syncDraftWithCredential();
  }, [syncDraftWithCredential]);

  return {
    draft,
    revealedKeyIds,
    persistedKeyIds,
    errors,
    lastAddedKeyId,
    isFetching,
    isSaving,
    isDeleting,
    handleNameChange,
    handleKeyChange,
    handleAddKey,
    handleRemoveKey,
    handleToggleReveal,
    handleSave,
    handleDelete,
  };
};
