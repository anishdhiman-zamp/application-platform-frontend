'use client';

import { useCallback, useRef, useState } from 'react';

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
}

const DEFAULT_OPTIONS: TranscriptionOptions = {
  modelId: 'scribe_v2_realtime',
  languageCode: 'en',
  includeTimestamps: false,
};

const noopGetToken = async () => '';

/**
 * Hook to manage real-time audio transcription.
 * Coordinates microphone recording and ElevenLabs WebSocket connection.
 */
export const useTranscription = ({ adapter }: UseTranscriptionOptions): UseTranscriptionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const stateRefs = useRef({
    isStarting: false,
    stopRequested: false,
  });

  const appendTranscript = useCallback((data: { text: string }) => {
    if (data.text) {
      setTranscript((prev) => (prev ? `${prev} ${data.text}` : data.text));
    }
  }, []);

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
      setTranscript('');

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
    [isRecording, connectToElevenLabs, setupMicrophone],
  );

  const stopRecording = useCallback(async () => {
    stateRefs.current.stopRequested = true;
    stateRefs.current.isStarting = false;
    setIsRecording(false);

    try {
      cleanupMicrophone();
      await disconnectFromElevenLabs();
    } catch {
      // Expected when cancelling in-progress connection
    }
  }, [cleanupMicrophone, disconnectFromElevenLabs]);

  const connectionState: SocketState = isConnected ? SOCKET_STATES.open : SOCKET_STATES.closed;

  return {
    transcript,
    isRecording,
    startRecording,
    stopRecording,
    microphone,
    microphoneState: microphoneState as MicrophoneState | null,
    connectionState,
    isCommitting,
  };
};
