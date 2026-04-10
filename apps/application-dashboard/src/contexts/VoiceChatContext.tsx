'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import { useVoiceChat } from '@zamp-platform/ui/hooks/useVoiceChat';
import type { UseVoiceChatReturn } from '@zamp-platform/ui/types';
import { useVoiceJoinMutation } from '@/apis/voiceAgents';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import useVoiceShortcuts from '@/hooks/useVoiceShortcuts';

interface VoiceChatContextType extends UseVoiceChatReturn {
  isVoiceChatEnabled: boolean;
}

const VoiceChatContext = createContext<VoiceChatContextType | null>(null);

export const useVoiceChatContext = (): VoiceChatContextType => {
  const context = useContext(VoiceChatContext);

  if (!context) {
    throw new Error('useVoiceChatContext must be used within VoiceChatProvider');
  }

  return context;
};

/**
 * Provides a single, persistent voice-chat session that survives
 * client-side navigation. Mount once in the authenticated layout.
 */
export const VoiceChatProvider = ({ children }: { children: ReactNode }) => {
  const { isEnabled: isVoiceChatEnabled } = useFeatureFlag(FEATURE_FLAGS.VOICE_CHAT);
  const [triggerVoiceJoin] = useVoiceJoinMutation();

  const fetchVoiceJoin = useCallback(
    async (body: Parameters<typeof triggerVoiceJoin>[0]) => {
      try {
        return await triggerVoiceJoin(body).unwrap();
      } catch (err) {
        const detail =
          err && typeof err === 'object' && 'status' in err
            ? String(err.status)
            : (err as { message?: string })?.message;

        throw new Error(`Voice join failed${detail ? `: ${detail}` : ''}`);
      }
    },
    [triggerVoiceJoin],
  );

  const voiceChat = useVoiceChat({ fetchJoin: fetchVoiceJoin });

  useVoiceShortcuts({ voice: voiceChat, enabled: isVoiceChatEnabled });

  const value = useMemo<VoiceChatContextType>(
    () => ({ ...voiceChat, isVoiceChatEnabled }),
    [voiceChat, isVoiceChatEnabled],
  );

  return <VoiceChatContext.Provider value={value}>{children}</VoiceChatContext.Provider>;
};
