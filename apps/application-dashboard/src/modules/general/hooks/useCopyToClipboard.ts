import { useState } from 'react';

export function useCopyToClipboard(text: string, resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    } catch {
      // clipboard write failed silently
    }
  }

  return { copied, handleCopy };
}
