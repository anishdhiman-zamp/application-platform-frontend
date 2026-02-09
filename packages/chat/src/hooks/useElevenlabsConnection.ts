'use client';

import { useScribe } from '@elevenlabs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SOCKET_STATES, SocketState } from '../types/transcription.types';
import { normalizeError } from '../utils/elevenlabs.utils';
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

const DEFAULT_SCRIBE_CONFIG = {
  modelId: 'scribe_v2_realtime',
  languageCode: 'en',
  includeTimestamps: false,
  microphone: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
} as const;

const ERROR_MESSAGES = {
  connection: 'Speech-to-text connection error',
  auth: 'Speech-to-text authentication failed. Please try again.',
  quota: 'Speech-to-text quota exceeded. Please try again later.',
  microphone: 'Microphone error occurred',
  connectFailed: 'Failed to connect to speech-to-text service',
} as const;

const COMMIT_WAIT_MS = 500;

/**
 * Hook to manage ElevenLabs Scribe connection lifecycle.
 *
 * Handles:
 * - WebSocket connection to ElevenLabs speech-to-text service
 * - Microphone setup and recording
 * - Race condition prevention (quick connect/disconnect)
 * - Error normalization and deduplication
 */
export const useElevenlabsConnection = (options: UseElevenlabsConnectionOptions): UseElevenlabsConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const callbackRefs = useRef({
    onCommittedTranscript: options.onCommittedTranscript,
    getToken: options.getToken,
    onError: options.onError,
  });

  useEffect(() => {
    callbackRefs.current = {
      onCommittedTranscript: options.onCommittedTranscript,
      getToken: options.getToken,
      onError: options.onError,
    };
  }, [options.onCommittedTranscript, options.getToken, options.onError]);

  const connectionStateRefs = useRef({
    hasReportedError: false,
    isConnecting: false,
    isIntentionalDisconnect: false,
    hasMicStarted: false,
  });

  /**
   * Reports an error only once per connection attempt.
   * Suppresses errors if disconnect was intentional (user cancelled).
   */
  const reportErrorOnce = useCallback((error: unknown, defaultMessage: string) => {
    const { hasReportedError, isIntentionalDisconnect } = connectionStateRefs.current;

    if (hasReportedError || isIntentionalDisconnect) {
      return;
    }

    connectionStateRefs.current.hasReportedError = true;
    const normalizedError = normalizeError(error, defaultMessage);
    callbackRefs.current.onError?.(normalizedError);
  }, []);

  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophoneRecorder({
    onError: (error) => reportErrorOnce(error, ERROR_MESSAGES.microphone),
  });

  const scribe = useScribe({
    ...DEFAULT_SCRIBE_CONFIG,
    onCommittedTranscript: (data: { text: string }) => {
      setIsCommitting(false);
      callbackRefs.current.onCommittedTranscript?.(data);
    },
    onError: (error: unknown) => {
      setIsConnected(false);
      reportErrorOnce(error, ERROR_MESSAGES.connection);
    },
    onAuthError: (error: unknown) => {
      setIsConnected(false);
      reportErrorOnce(error, ERROR_MESSAGES.auth);
    },
    onQuotaExceededError: (error: unknown) => {
      setIsConnected(false);
      reportErrorOnce(error, ERROR_MESSAGES.quota);
    },
  });

  useEffect(() => {
    setIsConnected(scribe.isConnected);
  }, [scribe.isConnected]);

  const shouldAbortConnection = useCallback(() => {
    return connectionStateRefs.current.isIntentionalDisconnect;
  }, []);

  /**
   * Establishes connection to ElevenLabs Scribe service.
   */
  const connectToElevenLabs = useCallback(
    async (connectOptions: ElevenLabsConnectionOptions = {}) => {
      connectionStateRefs.current.hasReportedError = false;
      connectionStateRefs.current.isIntentionalDisconnect = false;
      connectionStateRefs.current.isConnecting = true;

      try {
        setIsLoadingToken(true);
        setTokenError(false);

        const token = await callbackRefs.current.getToken();

        if (shouldAbortConnection()) {
          setIsLoadingToken(false);
          connectionStateRefs.current.isConnecting = false;
          return;
        }

        setIsLoadingToken(false);

        if (scribe.isConnected) {
          scribe.disconnect();
        }

        await scribe.connect({
          token,
          modelId: connectOptions.modelId ?? DEFAULT_SCRIBE_CONFIG.modelId,
          includeTimestamps: connectOptions.includeTimestamps ?? DEFAULT_SCRIBE_CONFIG.includeTimestamps,
          languageCode: connectOptions.languageCode ?? DEFAULT_SCRIBE_CONFIG.languageCode,
          microphone: {
            echoCancellation:
              connectOptions.microphone?.echoCancellation ?? DEFAULT_SCRIBE_CONFIG.microphone.echoCancellation,
            noiseSuppression:
              connectOptions.microphone?.noiseSuppression ?? DEFAULT_SCRIBE_CONFIG.microphone.noiseSuppression,
            autoGainControl:
              connectOptions.microphone?.autoGainControl ?? DEFAULT_SCRIBE_CONFIG.microphone.autoGainControl,
          },
        });

        if (shouldAbortConnection()) {
          scribe.disconnect();
          setIsConnected(false);
          connectionStateRefs.current.isConnecting = false;
          return;
        }

        setIsConnected(true);
        connectionStateRefs.current.isConnecting = false;
      } catch (error) {
        setIsLoadingToken(false);
        setTokenError(true);
        connectionStateRefs.current.isConnecting = false;

        if (!shouldAbortConnection()) {
          reportErrorOnce(error, ERROR_MESSAGES.connectFailed);
        }

        setIsConnected(false);
        throw error;
      }
    },
    [scribe, reportErrorOnce, shouldAbortConnection],
  );

  /**
   * Gracefully disconnects from ElevenLabs and cleans up resources.
   */
  const disconnectFromElevenLabs = useCallback(async () => {
    connectionStateRefs.current.isIntentionalDisconnect = true;

    try {
      const canCommit = scribe.isConnected && scribe.partialTranscript && !connectionStateRefs.current.isConnecting;

      if (canCommit) {
        setIsCommitting(true);
        await scribe.commit();
        await new Promise((resolve) => setTimeout(resolve, COMMIT_WAIT_MS));
      }

      scribe.disconnect();
      setIsConnected(false);
    } catch {
      scribe.disconnect();
      setIsConnected(false);
    }

    stopMicrophone();
    connectionStateRefs.current.hasMicStarted = false;
    connectionStateRefs.current.hasReportedError = false;
    connectionStateRefs.current.isConnecting = false;
    setIsCommitting(false);
    setIsLoadingToken(false);
  }, [scribe, stopMicrophone]);

  const startRecording = useCallback(async () => {
    if (microphone) return;
    await setupMicrophone();
  }, [setupMicrophone, microphone]);

  const stopRecording = useCallback(() => {
    stopMicrophone();
    connectionStateRefs.current.hasMicStarted = false;
  }, [stopMicrophone]);

  useEffect(() => {
    const shouldStartMic =
      microphone && isConnected && options.isRecording && !connectionStateRefs.current.hasMicStarted;

    if (!shouldStartMic) {
      return;
    }

    startMicrophone();
    connectionStateRefs.current.hasMicStarted = true;

    return () => {
      if (connectionStateRefs.current.hasMicStarted) {
        stopMicrophone();
        connectionStateRefs.current.hasMicStarted = false;
      }
    };
  }, [microphone, isConnected, options.isRecording, startMicrophone, stopMicrophone]);

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
    connectionState: isConnected ? SOCKET_STATES.open : SOCKET_STATES.closed,
    microphone,
    microphoneState,
  };
};
