import { useEffect, useRef, useState } from 'react';

interface UseTypingAnimationOptions {
  text: string;
  durationMs: number;
  delayMs: number;
  enabled: boolean;
  onComplete?: () => void;
}

export const useTypingAnimation = ({ text, durationMs, delayMs, enabled, onComplete }: UseTypingAnimationOptions) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!enabled) return;

    const delayTimer = setTimeout(() => {
      setIsVisible(true);

      const totalChars = text.length;
      const intervalMs = Math.max(1, Math.floor(durationMs / totalChars));
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));

        if (currentIndex >= totalChars) {
          clearInterval(typingInterval);
          setIsComplete(true);
          onCompleteRef.current?.();
        }
      }, intervalMs);

      return () => clearInterval(typingInterval);
    }, delayMs);

    return () => clearTimeout(delayTimer);
  }, [text, durationMs, delayMs, enabled]);

  return { displayedText, isVisible, isComplete };
};
