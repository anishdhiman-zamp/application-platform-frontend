'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { SOCKET_STATES, SocketState, TranscriptionOptions } from '../types/transcription.types';
import { MicrophoneEvents, MicrophoneState, useMicrophoneRecorder } from './useMicrophoneRecorder';

// Re-export types that consumers might need
export { SOCKET_STATES };
export type { SocketState };

export interface DeepgramTranscriptionEvent {
  is_final?: boolean;
  speech_final?: boolean;
  channel?: {
    alternatives: Array<{
      transcript?: string;
    }>;
  };
}

export interface UseDeepgramConnectionOptions {
  skip?: boolean;
  onTranscript?: (data: DeepgramTranscriptionEvent) => void;
  isRecording?: boolean;
  getToken: () => Promise<string>;
  onError?: (error: unknown) => void;
}

export interface UseDeepgramConnectionReturn {
  connectToDeepgram: (options: TranscriptionOptions, endpoint?: string) => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: SocketState;
  isLoadingToken: boolean;
  tokenError: boolean;
  microphone: MediaRecorder | null;
  microphoneState: MicrophoneState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

/**
 * Hook to manage Deepgram Speech-to-Text WebSocket connection lifecycle
 * Uses injectable getToken for token management
 */
export const useDeepgramConnection = (options: UseDeepgramConnectionOptions): UseDeepgramConnectionReturn => {
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<SocketState>(SOCKET_STATES.closed);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophoneRecorder({
    onError: options.onError,
  });

  // Keep WebSocket alive with periodic pings
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);

  // Track if microphone has been started to avoid duplicate starts
  const hasMicStartedRef = useRef(false);

  const onTranscriptRef = useRef(options.onTranscript);

  // Update ref when callback changes
  useEffect(() => {
    onTranscriptRef.current = options.onTranscript;
  }, [options.onTranscript]);

  // Establish WebSocket connection to Deepgram with provided options
  const connectToDeepgram = useCallback(
    async (transcriptionOptions: TranscriptionOptions, endpoint?: string) => {
      try {
        setIsLoadingToken(true);
        setTokenError(false);
        const token = await options.getToken();
        setIsLoadingToken(false);

        // Close existing connection before creating new one
        if (connection) {
          connection.close();
        }

        // Build WebSocket URL with options
        const params = new URLSearchParams();
        if (transcriptionOptions.model) params.set('model', transcriptionOptions.model);
        if (transcriptionOptions.language) params.set('language', transcriptionOptions.language);
        if (transcriptionOptions.smart_format) params.set('smart_format', 'true');
        if (transcriptionOptions.punctuation) params.set('punctuation', 'true');
        if (transcriptionOptions.interim_results) params.set('interim_results', 'true');

        const wsUrl = endpoint || `wss://api.deepgram.com/v1/listen?${params.toString()}`;
        const ws = new WebSocket(wsUrl, ['token', token]);

        ws.onopen = () => {
          setConnectionState(SOCKET_STATES.open);
        };

        ws.onclose = () => {
          setConnectionState(SOCKET_STATES.closed);
        };

        ws.onerror = (error) => {
          ws.close();
          setConnectionState(SOCKET_STATES.closed);
          options.onError?.(error);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as DeepgramTranscriptionEvent;
            if (onTranscriptRef.current) {
              onTranscriptRef.current(data);
            }
          } catch {
            // Ignore parse errors
          }
        };

        setConnection(ws);
      } catch (error) {
        setIsLoadingToken(false);
        setTokenError(true);
        options.onError?.(error);
        setConnectionState(SOCKET_STATES.closed);
        throw error;
      }
    },
    [connection, options],
  );

  // Gracefully close the WebSocket connection
  const disconnectFromDeepgram = useCallback(() => {
    if (connection) {
      connection.close();
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
      if (connection && connection.readyState === WebSocket.OPEN && e.data.size > 0) {
        connection.send(e.data);
      }
    },
    [connection],
  );

  // Stream audio data to Deepgram
  useEffect(() => {
    if (options.skip || !microphone || !connection || !options.isRecording || connectionState !== SOCKET_STATES.open) {
      return;
    }

    microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

    // Start microphone recording once connection is ready
    if (!hasMicStartedRef.current) {
      startMicrophone();
      hasMicStartedRef.current = true;
    }

    return () => {
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
    };
  }, [connection, microphone, options.isRecording, connectionState, startMicrophone, onData, options.skip]);

  // Maintain WebSocket connection with keep-alive pings
  useEffect(() => {
    if (options.skip || !connection || !options.isRecording) return;

    if (microphoneState !== MicrophoneState.Open && connectionState === SOCKET_STATES.open) {
      // Send keep-alive
      try {
        connection.send(JSON.stringify({ type: 'KeepAlive' }));
      } catch {
        // Ignore errors
      }
      keepAliveInterval.current = setInterval(() => {
        try {
          connection.send(JSON.stringify({ type: 'KeepAlive' }));
        } catch {
          // Ignore errors
        }
      }, 10000);
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
  }, [microphoneState, connectionState, options.isRecording, connection, options.skip]);

  // Cleanup: close connection when component unmounts
  useEffect(() => {
    return () => {
      if (connection) connection.close();
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
        keepAliveInterval.current = null;
      }
      if (options.isRecording) {
        stopMicrophone();
      }
    };
  }, []);

  return {
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
