import { useCallback, useState } from 'react';
import { useLazyGetCredentialQuery } from '@/apis/credentials';

interface UseCredentialRevealParams {
  credentialId: string;
}

export const useCredentialReveal = ({ credentialId }: UseCredentialRevealParams) => {
  const [revealedKeyNames, setRevealedKeyNames] = useState<Set<string>>(new Set());
  const [decryptedBody, setDecryptedBody] = useState<Record<string, string> | null>(null);
  const [revealingKeyNames, setRevealingKeyNames] = useState<Set<string>>(new Set());
  const [copyingKeyNames, setCopyingKeyNames] = useState<Set<string>>(new Set());

  const [fetchCredential] = useLazyGetCredentialQuery();

  const ensureDecrypted = useCallback((): Promise<Record<string, string> | null> => {
    if (decryptedBody) return Promise.resolve(decryptedBody);

    return fetchCredential({ credential_id: credentialId, decrypt: true })
      .unwrap()
      .then((credential) => {
        const body = credential?.body ?? null;

        setDecryptedBody(body);

        return body;
      })
      .catch(() => null);
  }, [credentialId, decryptedBody, fetchCredential]);

  const removeFrom = (set: Set<string>, keyName: string) => {
    if (!set.has(keyName)) return set;

    const next = new Set(set);

    next.delete(keyName);

    return next;
  };

  const handleToggleReveal = useCallback(
    (keyName: string) => {
      const isCurrentlyRevealed = revealedKeyNames.has(keyName);

      if (isCurrentlyRevealed) {
        setRevealedKeyNames((prev) => removeFrom(prev, keyName));

        return;
      }

      if (decryptedBody) {
        setRevealedKeyNames((prev) => new Set(prev).add(keyName));

        return;
      }

      setRevealingKeyNames((prev) => new Set(prev).add(keyName));
      ensureDecrypted().finally(() => {
        setRevealedKeyNames((prev) => new Set(prev).add(keyName));
        setRevealingKeyNames((prev) => removeFrom(prev, keyName));
      });
    },
    [decryptedBody, ensureDecrypted, revealedKeyNames],
  );

  const handleResolveValue = useCallback(
    (keyName: string): Promise<string> => {
      setCopyingKeyNames((prev) => new Set(prev).add(keyName));

      return ensureDecrypted()
        .then((body) => body?.[keyName] ?? '')
        .finally(() => {
          setCopyingKeyNames((prev) => removeFrom(prev, keyName));
        });
    },
    [ensureDecrypted],
  );

  return {
    revealedKeyNames,
    revealingKeyNames,
    copyingKeyNames,
    decryptedBody,
    handleToggleReveal,
    handleResolveValue,
  };
};
