'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  SOCKET_STATES,
  SocketState,
  TranscriptionAdapter,
  TranscriptionOptions,
  UseTranscriptionReturn,
} from '../types/transcription.types';
import { useElevenlabsConnection } from './useElevenlabsConnection';
import { MicrophoneState } from './useMicrophoneRecorder';

export interface UseTranscriptionOptions {
  adapter: TranscriptionAdapter;
  onTranscriptChunk?: (chunk: string) => void;
}

const DEFAULT_OPTIONS: TranscriptionOptions = {
  modelId: 'scribe_v2_realtime',
  languageCode: 'en',
  includeTimestamps: false,
};

/** Auto-stop recording after this many ms of silence once speech has been detected */
const INACTIVITY_TIMEOUT_MS = 3000;

const noopGetToken = async () => '';

/**
 * Hook to manage real-time audio transcription.
 * Coordinates microphone recording and ElevenLabs WebSocket connection.
 */
export const useTranscription = ({ adapter, onTranscriptChunk }: UseTranscriptionOptions): UseTranscriptionReturn => {
  const [isRecording, setIsRecording] = useState(false);

  const stateRefs = useRef({
    isStarting: false,
    stopRequested: false,
  });

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRecordingRef = useRef<() => void | Promise<void>>(() => {});
  const resetInactivityTimerRef = useRef<() => void>(() => {});
  const hasSpeechRef = useRef(false);

  const appendTranscript = useCallback(
    (data: { text: string }) => {
      if (data.text) {
        hasSpeechRef.current = true;
        onTranscriptChunk?.(data.text);
        resetInactivityTimerRef.current();
      }
    },
    [onTranscriptChunk],
  );

  const {
    connectToElevenLabs,
    disconnectFromElevenLabs,
    isConnected,
    isCommitting,
    microphone,
    microphoneState,
    startRecording: setupMicrophone,
    stopRecording: cleanupMicrophone,
  } = useElevenlabsConnection({
    onCommittedTranscript: appendTranscript,
    isRecording,
    getToken: adapter.getElevenLabsToken || noopGetToken,
    onError: adapter.onError,
  });

  const startRecording = useCallback(
    async (options: TranscriptionOptions = {}) => {
      if (stateRefs.current.isStarting || isRecording) return;

      stateRefs.current.isStarting = true;
      stateRefs.current.stopRequested = false;
      setIsRecording(true);

      try {
        await setupMicrophone();

        if (stateRefs.current.stopRequested) {
          setIsRecording(false);
          stateRefs.current.isStarting = false;
          return;
        }

        await connectToElevenLabs({ ...DEFAULT_OPTIONS, ...options });
      } catch {
        cleanupMicrophone();
        setIsRecording(false);
      } finally {
        stateRefs.current.isStarting = false;
      }
    },
    [isRecording, connectToElevenLabs, setupMicrophone, cleanupMicrophone],
  );

  const stopRecording = useCallback(async () => {
    stateRefs.current.stopRequested = true;
    stateRefs.current.isStarting = false;
    hasSpeechRef.current = false;
    setIsRecording(false);

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    try {
      cleanupMicrophone();
      await disconnectFromElevenLabs();
    } catch {
      // Expected when cancelling in-progress connection
    }
  }, [cleanupMicrophone, disconnectFromElevenLabs]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    if (isRecording && hasSpeechRef.current) {
      inactivityTimerRef.current = setTimeout(() => {
        stopRecordingRef.current();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [isRecording]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => {
    resetInactivityTimerRef.current = resetInactivityTimer;
  }, [resetInactivityTimer]);

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [resetInactivityTimer]);

  const connectionState: SocketState = isConnected ? SOCKET_STATES.open : SOCKET_STATES.closed;

  return {
    isRecording,
    startRecording,
    stopRecording,
    microphone,
    microphoneState: microphoneState as MicrophoneState | null,
    connectionState,
    isCommitting,
  };
};
