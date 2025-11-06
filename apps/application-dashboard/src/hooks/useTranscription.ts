'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type LiveTranscriptionEvent, LiveTranscriptionEvents, SOCKET_STATES } from '@deepgram/sdk';
import { captureException } from '@sentry/browser';
import { useDeepgramConnection } from 'hooks/useDeepgramConnection';
import { MicrophoneEvents, MicrophoneState, useMicrophoneRecorder } from 'hooks/useMicrophoneRecorder';
import type { defaultFnType } from '@/types/commonTypes';

interface TranscriptionOptions {
  model?: string;
  language?: string;
  interim_results?: boolean;
  smart_format?: boolean;
  punctuation?: boolean;
  utterance_end_ms?: number;
}

interface UseTranscriptionReturn {
  transcript: string;
  isRecording: boolean;
  startRecording: (options?: TranscriptionOptions) => Promise<void>;
  stopRecording: defaultFnType;
  microphone: MediaRecorder | null;
  microphoneState: MicrophoneState | null;
  connectionState: SOCKET_STATES;
}

// Default Deepgram transcription settings
export const defaultOptions: TranscriptionOptions = {
  model: 'nova-3',
  language: 'en-US',
  smart_format: true,
  punctuation: true,
};

/**
 * Hook to manage real-time audio transcription by coordinating microphone recording
 * and Deepgram WebSocket connection
 */
export const useTranscription = (): UseTranscriptionReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');

  const { connection, connectToDeepgram, disconnectFromDeepgram, connectionState } = useDeepgramConnection();
  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophoneRecorder();

  // Keep WebSocket alive with periodic pings
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);
  // Prevent concurrent start calls
  const isStartingRef = useRef(false);
  // Track if microphone has been started to avoid duplicate starts
  const hasMicStartedRef = useRef(false);

  // Initialize recording: setup microphone and establish Deepgram connection
  const startRecording = useCallback(
    async (options: TranscriptionOptions = {}) => {
      if (isStartingRef.current || isRecording) return;

      isStartingRef.current = true;
      setIsRecording(true);
      setAccumulatedTranscript('');
      hasMicStartedRef.current = false;

      try {
        await setupMicrophone();
        await connectToDeepgram({ ...defaultOptions, ...options });
      } catch {
        setIsRecording(false);
        hasMicStartedRef.current = false;
      } finally {
        isStartingRef.current = false;
      }
    },
    [isRecording, microphoneState, setupMicrophone, connectToDeepgram],
  );

  // Stop recording and cleanup resources
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    hasMicStartedRef.current = false;
    isStartingRef.current = false;

    try {
      stopMicrophone();
      disconnectFromDeepgram();
    } catch (error) {
      captureException(error);
      throw error;
    }
  }, [stopMicrophone, disconnectFromDeepgram]);

  // Send audio chunks to Deepgram
  const onData = useCallback(
    (e: BlobEvent) => {
      if (connection && e.data.size > 0) {
        connection.send(e.data);
      }
    },
    [connection],
  );

  // Accumulate final transcription results
  const onTranscript = useCallback((data: LiveTranscriptionEvent) => {
    const { is_final, speech_final } = data;
    const text = data.channel?.alternatives[0]?.transcript?.trim();

    if (text && is_final && speech_final) {
      setAccumulatedTranscript((prev) => (prev ? `${prev} ${text}` : text));
    }
  }, []);

  // Stream audio data to Deepgram and handle transcription results
  useEffect(() => {
    if (!microphone || !connection || !isRecording || connectionState !== SOCKET_STATES.open) return;

    connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
    microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

    // Start microphone recording once connection is ready
    if (!hasMicStartedRef.current) {
      startMicrophone();
      hasMicStartedRef.current = true;
    }

    return () => {
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
    };
  }, [connection, microphone, isRecording, connectionState, startMicrophone, onData, onTranscript]);

  // Maintain WebSocket connection with keep-alive pings when microphone isn't actively sending data
  useEffect(() => {
    if (!connection || !isRecording) return;

    if (microphoneState !== MicrophoneState.Open && connectionState === SOCKET_STATES.open) {
      connection.keepAlive();
      keepAliveInterval.current = setInterval(() => connection.keepAlive(), 10000);
    } else {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
        keepAliveInterval.current = null;
      }
    }

    return () => {
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
        keepAliveInterval.current = null;
      }
    };
  }, [microphoneState, connectionState, isRecording, connection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) stopMicrophone();
      disconnectFromDeepgram();
      if (keepAliveInterval.current) clearInterval(keepAliveInterval.current);
    };
  }, []);

  return {
    transcript: accumulatedTranscript,
    isRecording,
    startRecording,
    stopRecording,
    microphone,
    microphoneState,
    connectionState,
  };
};
