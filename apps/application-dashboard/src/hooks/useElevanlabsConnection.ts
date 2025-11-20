'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useScribe } from '@elevenlabs/react';
import { captureException } from '@sentry/browser';
import { MicrophoneState, useMicrophoneRecorder } from 'hooks/useMicrophoneRecorder';
import { useLazyGetSpeechToTextAccessTokenQuery } from '@/apis/voiceAgents';
import type { defaultFnType } from '@/types/commonTypes';

interface ElevenLabsConnectionOptions {
  modelId?: string;
  languageCode?: string;
  includeTimestamps?: boolean;
  microphone?: {
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
  };
}

interface UseElevanlabsConnectionOptions {
  onCommittedTranscript?: (data: { text: string }) => void;
  isRecording?: boolean;
}

interface UseElevanlabsConnectionReturn {
  connectToElevenLabs: (options?: ElevenLabsConnectionOptions) => Promise<void>;
  disconnectFromElevenLabs: () => void;
  isConnected: boolean;
  isLoadingToken: boolean;
  tokenError: boolean;
  isCommitting: boolean;
  microphone: MediaRecorder | null;
  microphoneState: MicrophoneState | null;
  startRecording: () => Promise<void>;
  stopRecording: defaultFnType;
}

/**
 * Hook to manage ElevenLabs Scribe connection lifecycle
 * Uses useSpeechToTextAccessToken for token management
 * @param options - Optional configuration including onCommittedTranscript callback and skip flag
 */
export const useElevanlabsConnection = (options?: UseElevanlabsConnectionOptions): UseElevanlabsConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const onCommittedTranscriptRef = useRef(options?.onCommittedTranscript);

  const [getSpeechToTextAccessToken, { isLoading: isLoadingToken, isError: tokenError }] =
    useLazyGetSpeechToTextAccessTokenQuery({});

  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophoneRecorder();

  // Track if microphone has been started to avoid duplicate starts
  const hasMicStartedRef = useRef(false);

  // Update ref when callback changes
  useEffect(() => {
    onCommittedTranscriptRef.current = options?.onCommittedTranscript;
  }, [options?.onCommittedTranscript]);

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    languageCode: 'en',
    includeTimestamps: false,
    microphone: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    onCommittedTranscript: (data: { text: string }) => {
      if (onCommittedTranscriptRef.current) {
        setIsCommitting(false);
        onCommittedTranscriptRef.current(data);
      }
    },
    onError: (error: unknown) => {
      setIsConnected(false);
      captureException(error instanceof Error ? error : new Error(String(error)));
    },
    onAuthError: (error: unknown) => {
      setIsConnected(false);
      captureException(error instanceof Error ? error : new Error(String(error)));
    },
    onQuotaExceededError: (error: unknown) => {
      setIsConnected(false);
      captureException(error instanceof Error ? error : new Error(String(error)));
    },
  });

  // Track connection state
  useEffect(() => {
    setIsConnected(scribe.isConnected);
  }, [scribe.isConnected]);

  // Establish connection to ElevenLabs Scribe with provided options
  const connectToElevenLabs = useCallback(
    async (connectOptions: ElevenLabsConnectionOptions = {}) => {
      try {
        const result = await getSpeechToTextAccessToken({}).unwrap();
        const token = result.access_token;

        // Disconnect existing connection before creating new one
        if (scribe.isConnected) {
          scribe.disconnect();
        }

        // Connect with token and options
        await scribe.connect({
          token,
          includeTimestamps: connectOptions.includeTimestamps ?? false,
          languageCode: connectOptions.languageCode || 'en',
          microphone: {
            echoCancellation: connectOptions.microphone?.echoCancellation ?? true,
            noiseSuppression: connectOptions.microphone?.noiseSuppression ?? true,
            autoGainControl: connectOptions.microphone?.autoGainControl ?? true,
          },
        });

        setIsConnected(true);
      } catch (error) {
        captureException(error);
        setIsConnected(false);
        throw error;
      }
    },
    [scribe, getSpeechToTextAccessToken],
  );

  // Start recording: setup microphone (actual start happens in effect when connection is ready)
  const startRecording = useCallback(async () => {
    if (microphone) return; // Already set up
    await setupMicrophone();
  }, [setupMicrophone, microphone]);

  // Stop recording: stop microphone
  const stopRecording = useCallback(() => {
    stopMicrophone();
    hasMicStartedRef.current = false;
  }, [stopMicrophone]);

  // Gracefully disconnect from ElevenLabs
  const disconnectFromElevenLabs = useCallback(async () => {
    try {
      // Commit any pending transcript before disconnecting
      if (scribe.partialTranscript) {
        setIsCommitting(true);
        await scribe.commit();
        // Wait a bit for the commit callback to fire
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      scribe.disconnect();
      setIsConnected(false);
    } catch (error) {
      captureException(error);
      // Still disconnect even if commit fails
      scribe.disconnect();
      setIsConnected(false);
    }
    stopMicrophone();
    hasMicStartedRef.current = false;
  }, [scribe, stopMicrophone]);

  // Start microphone recording when connection is ready and recording is active
  useEffect(() => {
    if (!microphone || !isConnected || !options?.isRecording || hasMicStartedRef.current) {
      return;
    }

    // Start microphone recording for visualization
    startMicrophone();
    hasMicStartedRef.current = true;

    return () => {
      if (hasMicStartedRef.current) {
        stopMicrophone();
        hasMicStartedRef.current = false;
      }
    };
  }, [microphone, isConnected, options?.isRecording, startMicrophone, stopMicrophone]);

  // Cleanup: disconnect when component unmounts
  useEffect(() => {
    return () => {
      if (scribe.isConnected) {
        scribe.disconnect();
      }
      if (options?.isRecording) {
        stopMicrophone();
      }
    };
  }, []);

  return {
    connectToElevenLabs,
    disconnectFromElevenLabs,
    startRecording,
    stopRecording,
    isConnected,
    isLoadingToken,
    tokenError,
    isCommitting,
    microphone,
    microphoneState,
  };
};
