'use client';

import { useCallback, useRef, useState } from 'react';
import { type LiveTranscriptionEvent, SOCKET_STATES } from '@deepgram/sdk';
import { captureException } from '@sentry/browser';
import { useDeepgramConnection } from 'hooks/useDeepgramConnection';
import { useElevanlabsConnection } from 'hooks/useElevanlabsConnection';
import { MicrophoneState } from 'hooks/useMicrophoneRecorder';
import { SpeechToTextProvider } from '@/types/api/voiceAgent.types';
import type { defaultFnType } from '@/types/commonTypes';

interface TranscriptionOptions {
  model?: string;
  language?: string;
  interim_results?: boolean;
  smart_format?: boolean;
  punctuation?: boolean;
  utterance_end_ms?: number;

  // ElevenLabs specific options
  modelId?: string;
  languageCode?: string;
  includeTimestamps?: boolean;
}

interface UseTranscriptionReturn {
  transcript: string;
  isRecording: boolean;
  startRecording: (options?: TranscriptionOptions) => Promise<void>;
  stopRecording: defaultFnType;
  microphone: MediaRecorder | null;
  microphoneState: MicrophoneState | null;
  connectionState: SOCKET_STATES;
  isCommitting: boolean;
}

// Default Deepgram transcription settings
export const defaultDeepgramOptions: TranscriptionOptions = {
  model: 'nova-3',
  language: 'en-US',
  smart_format: true,
  punctuation: true,
};

// Default ElevenLabs transcription settings
export const defaultElevenLabsOptions: TranscriptionOptions = {
  modelId: 'scribe_v2_realtime',
  languageCode: 'en',
  includeTimestamps: false,
};

/**
 * Hook to manage real-time audio transcription by coordinating microphone recording
 * and provider-specific WebSocket connections
 */
export const useTranscription = (
  provider: SpeechToTextProvider = SpeechToTextProvider.ELEVENLABS,
): UseTranscriptionReturn => {
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

  // Accumulate final transcription results from Deepgram
  const onDeepgramTranscript = useCallback((data: LiveTranscriptionEvent) => {
    const { is_final, speech_final } = data;
    const text = data.channel?.alternatives[0]?.transcript?.trim();

    if (text && is_final && speech_final) {
      setAccumulatedTranscript((prev) => (prev ? `${prev} ${text}` : text));
    }
  }, []);

  const {
    connectToDeepgram,
    disconnectFromDeepgram,
    connectionState: deepgramConnectionState,
    microphone: deepgramMicrophone,
    microphoneState: deepgramMicrophoneState,
    startRecording: startDeepgramRecording,
    stopRecording: stopDeepgramRecording,
  } = useDeepgramConnection({
    skip: provider !== SpeechToTextProvider.DEEPGRAM,
    onTranscript: onDeepgramTranscript,
    isRecording,
  });

  const {
    connectToElevenLabs,
    disconnectFromElevenLabs,
    isConnected: elevenLabsIsConnected,
    isCommitting: elevenLabsIsCommitting,
    microphone: elevenLabsMicrophone,
    microphoneState: elevenLabsMicrophoneState,
    startRecording: startElevenLabsRecording,
    stopRecording: stopElevenLabsRecording,
  } = useElevanlabsConnection({
    onCommittedTranscript: onElevenLabsTranscript,
    isRecording,
  });

  // Determine connection state based on provider
  const connectionState =
    provider === SpeechToTextProvider.DEEPGRAM
      ? deepgramConnectionState
      : elevenLabsIsConnected
        ? SOCKET_STATES.open
        : SOCKET_STATES.closed;

  // Initialize recording: establish connection and start recording
  const startRecording = useCallback(
    async (options: TranscriptionOptions = {}) => {
      if (isStartingRef.current || isRecording) return;

      isStartingRef.current = true;
      setIsRecording(true);
      setAccumulatedTranscript('');

      try {
        if (provider === SpeechToTextProvider.DEEPGRAM) {
          await startDeepgramRecording();
          await connectToDeepgram({ ...defaultDeepgramOptions, ...options });
        } else {
          await startElevenLabsRecording();
          await connectToElevenLabs({
            ...defaultElevenLabsOptions,
            ...options,
          });
        }
      } catch {
        setIsRecording(false);
      } finally {
        isStartingRef.current = false;
      }
    },
    [isRecording, connectToDeepgram, connectToElevenLabs, provider, startDeepgramRecording, startElevenLabsRecording],
  );

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    isStartingRef.current = false;

    try {
      if (provider === SpeechToTextProvider.DEEPGRAM) {
        stopDeepgramRecording();
        disconnectFromDeepgram();
      } else {
        stopElevenLabsRecording();
        await disconnectFromElevenLabs();
      }
    } catch (error) {
      captureException(error);
      throw error;
    }
  }, [stopDeepgramRecording, stopElevenLabsRecording, disconnectFromDeepgram, disconnectFromElevenLabs, provider]);

  // Determine microphone and microphoneState based on provider
  const microphone = provider === SpeechToTextProvider.DEEPGRAM ? deepgramMicrophone : elevenLabsMicrophone;
  const microphoneState =
    provider === SpeechToTextProvider.DEEPGRAM ? deepgramMicrophoneState : elevenLabsMicrophoneState;

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
