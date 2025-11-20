'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createClient,
  LiveClient,
  type LiveSchema,
  type LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  SOCKET_STATES,
} from '@deepgram/sdk';
import { captureException } from '@sentry/browser';
import { useDeepgramToken } from 'hooks/useDeepgramToken';
import { MicrophoneEvents, MicrophoneState, useMicrophoneRecorder } from 'hooks/useMicrophoneRecorder';
import type { defaultFnType } from '@/types/commonTypes';

interface UseDeepgramConnectionOptions {
  skip?: boolean;
  onTranscript?: (data: LiveTranscriptionEvent) => void;
  isRecording?: boolean;
}

interface UseDeepgramConnectionReturn {
  connection: LiveClient | null;
  connectToDeepgram: (options: LiveSchema, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SOCKET_STATES;
  isLoadingToken: boolean;
  tokenError: boolean;
  microphone: MediaRecorder | null;
  microphoneState: MicrophoneState | null;
  startRecording: () => Promise<void>;
  stopRecording: defaultFnType;
}

/**
 * Hook to manage Speech-to-Text WebSocket connection lifecycle
 * Uses useSpeechToTextAccessToken for token management
 * @param options - Optional configuration including skip flag, onTranscript callback, and isRecording state
 */
export const useDeepgramConnection = (options?: UseDeepgramConnectionOptions): UseDeepgramConnectionReturn => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.closed);

  const { getValidToken, isLoadingToken, tokenError } = useDeepgramToken(options?.skip);

  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophoneRecorder();

  // Keep WebSocket alive with periodic pings
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);

  // Track if microphone has been started to avoid duplicate starts
  const hasMicStartedRef = useRef(false);

  const onTranscriptRef = useRef(options?.onTranscript);

  // Establish WebSocket connection to Deepgram with provided options
  const connectToDeepgram = useCallback(
    async (options: LiveSchema, endpoint?: string) => {
      try {
        const token = await getValidToken();

        // Close existing connection before creating new one
        if (connection) {
          connection.requestClose();
        }

        const deepgram = createClient({ accessToken: token });
        const conn = deepgram.listen.live(options, endpoint);

        // Set up connection event listeners
        conn.addListener(LiveTranscriptionEvents.Open, () => {
          setConnectionState(SOCKET_STATES.open);
        });

        conn.addListener(LiveTranscriptionEvents.Close, () => {
          setConnectionState(SOCKET_STATES.closed);
        });

        conn.addListener(LiveTranscriptionEvents.Error, (error) => {
          conn.requestClose();
          setConnectionState(SOCKET_STATES.closed);
          throw error;
        });

        setConnection(conn);
      } catch (error) {
        captureException(error);
        setConnectionState(SOCKET_STATES.closed);
        throw error;
      }
    },
    [connection, getValidToken],
  );

  // Update ref when callback changes
  useEffect(() => {
    onTranscriptRef.current = options?.onTranscript;
  }, [options?.onTranscript]);

  // Gracefully close the WebSocket connection
  const disconnectFromDeepgram = useCallback(() => {
    if (connection) {
      connection.requestClose();
      setConnection(null);
      setConnectionState(SOCKET_STATES.closed);
    }
    stopMicrophone();
    hasMicStartedRef.current = false;
  }, [connection, stopMicrophone]);

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

  // Send audio chunks to Deepgram
  const onData = useCallback(
    (e: BlobEvent) => {
      if (connection && e.data.size > 0) {
        connection.send(e.data);
      }
    },
    [connection],
  );

  // Handle transcription results
  const onTranscript = useCallback((data: LiveTranscriptionEvent) => {
    if (onTranscriptRef.current) {
      onTranscriptRef.current(data);
    }
  }, []);

  // Stream audio data to Deepgram and handle transcription results
  useEffect(() => {
    if (
      options?.skip ||
      !microphone ||
      !connection ||
      !options?.isRecording ||
      connectionState !== SOCKET_STATES.open
    ) {
      return;
    }

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
  }, [
    connection,
    microphone,
    options?.isRecording,
    connectionState,
    startMicrophone,
    onData,
    onTranscript,
    options?.skip,
  ]);

  // Maintain WebSocket connection with keep-alive pings when microphone isn't actively sending data
  useEffect(() => {
    if (options?.skip || !connection || !options?.isRecording) return;

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
  }, [microphoneState, connectionState, options?.isRecording, connection, options?.skip]);

  // Cleanup: close connection when component unmounts
  useEffect(() => {
    return () => {
      if (connection) connection.requestClose();
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
        keepAliveInterval.current = null;
      }
      if (options?.isRecording) {
        stopMicrophone();
      }
    };
  }, [connection, options?.isRecording, stopMicrophone]);

  return {
    connection,
    connectToDeepgram,
    disconnectFromDeepgram,
    connectionState,
    isLoadingToken,
    tokenError,
    microphone,
    microphoneState,
    startRecording,
    stopRecording,
  };
};
