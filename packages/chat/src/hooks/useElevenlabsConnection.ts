'use client';

import { useScribe } from '@elevenlabs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SOCKET_STATES, SocketState } from '../types/transcription.types';
import { MicrophoneState, useMicrophoneRecorder } from './useMicrophoneRecorder';

export interface ElevenLabsConnectionOptions {
  modelId?: string;
  languageCode?: string;
  includeTimestamps?: boolean;
  microphone?: {
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
  };
}

export interface UseElevenlabsConnectionOptions {
  onCommittedTranscript?: (data: { text: string }) => void;
  isRecording?: boolean;
  getToken: () => Promise<string>;
  onError?: (error: unknown) => void;
}

export interface UseElevenlabsConnectionReturn {
  connectToElevenLabs: (options?: ElevenLabsConnectionOptions) => Promise<void>;
  disconnectFromElevenLabs: () => Promise<void>;
  isConnected: boolean;
  isLoadingToken: boolean;
  tokenError: boolean;
  isCommitting: boolean;
  microphone: MediaRecorder | null;
  microphoneState: MicrophoneState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  connectionState: SocketState;
}

/**
 * Hook to manage ElevenLabs Scribe connection lifecycle
 * Uses injectable getToken for token management and @elevenlabs/react's useScribe for connection
 */
export const useElevenlabsConnection = (options: UseElevenlabsConnectionOptions): UseElevenlabsConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const onCommittedTranscriptRef = useRef(options.onCommittedTranscript);
  const getTokenRef = useRef(options.getToken);
  const onErrorRef = useRef(options.onError);

  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophoneRecorder({
    onError: options.onError,
  });

  // Track if microphone has been started to avoid duplicate starts
  const hasMicStartedRef = useRef(false);

  // Update refs when callbacks change
  useEffect(() => {
    onCommittedTranscriptRef.current = options.onCommittedTranscript;
  }, [options.onCommittedTranscript]);

  useEffect(() => {
    getTokenRef.current = options.getToken;
  }, [options.getToken]);

  useEffect(() => {
    onErrorRef.current = options.onError;
  }, [options.onError]);

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
      onErrorRef.current?.(error);
    },
    onAuthError: (error: unknown) => {
      setIsConnected(false);
      onErrorRef.current?.(error);
    },
    onQuotaExceededError: (error: unknown) => {
      setIsConnected(false);
      onErrorRef.current?.(error);
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
        setIsLoadingToken(true);
        setTokenError(false);
        const token = await getTokenRef.current();
        setIsLoadingToken(false);

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
        setIsLoadingToken(false);
        setTokenError(true);
        onErrorRef.current?.(error);
        setIsConnected(false);
        throw error;
      }
    },
    [scribe],
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
      onErrorRef.current?.(error);
      // Still disconnect even if commit fails
      scribe.disconnect();
      setIsConnected(false);
    }
    stopMicrophone();
    hasMicStartedRef.current = false;
  }, [scribe, stopMicrophone]);

  // Start microphone recording when connection is ready and recording is active
  useEffect(() => {
    if (!microphone || !isConnected || !options.isRecording || hasMicStartedRef.current) {
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
  }, [microphone, isConnected, options.isRecording, startMicrophone, stopMicrophone]);

  // Cleanup: disconnect when component unmounts
  useEffect(() => {
    return () => {
      if (scribe.isConnected) {
        scribe.disconnect();
      }
      if (options.isRecording) {
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
    connectionState: isConnected ? SOCKET_STATES.open : SOCKET_STATES.closed,
  };
};
