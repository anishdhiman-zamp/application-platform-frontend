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

// Default ElevenLabs transcription settings
export const defaultElevenLabsOptions: TranscriptionOptions = {
  modelId: 'scribe_v2_realtime',
  languageCode: 'en',
  includeTimestamps: false,
};

export interface UseTranscriptionOptions {
  adapter: TranscriptionAdapter;
}

/**
 * Hook to manage real-time audio transcription by coordinating microphone recording
 * and ElevenLabs WebSocket connection
 */
export const useTranscription = ({ adapter }: UseTranscriptionOptions): UseTranscriptionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');

  // Prevent concurrent start calls
  const isStartingRef = useRef(false);

  // Accumulate committed transcripts from ElevenLabs
  const onElevenLabsTranscript = useCallback((data: { text: string }) => {
    if (data.text) {
      setAccumulatedTranscript((prev) => (prev ? `${prev} ${data.text}` : data.text));
    }
  }, []);

  // Create a no-op token getter as fallback
  const noopGetToken = useCallback(async () => '', []);

  const {
    connectToElevenLabs,
    disconnectFromElevenLabs,
    isConnected: elevenLabsIsConnected,
    isCommitting: elevenLabsIsCommitting,
    microphone: elevenLabsMicrophone,
    microphoneState: elevenLabsMicrophoneState,
    startRecording: startElevenLabsRecording,
    stopRecording: stopElevenLabsRecording,
  } = useElevenlabsConnection({
    onCommittedTranscript: onElevenLabsTranscript,
    isRecording,
    getToken: adapter.getElevenLabsToken || noopGetToken,
    onError: adapter.onError,
  });

  const connectionState: SocketState = elevenLabsIsConnected ? SOCKET_STATES.open : SOCKET_STATES.closed;

  // Initialize recording: establish connection and start recording
  const startRecording = useCallback(
    async (options: TranscriptionOptions = {}) => {
      if (isStartingRef.current || isRecording) return;

      isStartingRef.current = true;
      setIsRecording(true);
      setAccumulatedTranscript('');

      try {
        await startElevenLabsRecording();
        await connectToElevenLabs({
          ...defaultElevenLabsOptions,
          ...options,
        });
      } catch {
        setIsRecording(false);
      } finally {
        isStartingRef.current = false;
      }
    },
    [isRecording, connectToElevenLabs, startElevenLabsRecording],
  );

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    isStartingRef.current = false;

    try {
      stopElevenLabsRecording();
      await disconnectFromElevenLabs();
    } catch (error) {
      adapter.onError?.(error);
      throw error;
    }
  }, [stopElevenLabsRecording, disconnectFromElevenLabs, adapter]);

  const microphone = elevenLabsMicrophone;
  const microphoneState: MicrophoneState | null = elevenLabsMicrophoneState;

  return {
    transcript: accumulatedTranscript,
    isRecording,
    startRecording,
    stopRecording,
    microphone,
    microphoneState,
    connectionState,
    isCommitting: elevenLabsIsCommitting,
  };
};
