'use client';

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
 * Uses injectable getToken for token management
 * Note: This is a simplified implementation that doesn't use @elevenlabs/react
 * to avoid adding that dependency to the package
 */
export const useElevenlabsConnection = (options: UseElevenlabsConnectionOptions): UseElevenlabsConnectionReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [connection, setConnection] = useState<WebSocket | null>(null);

  const onCommittedTranscriptRef = useRef(options.onCommittedTranscript);
  const partialTranscriptRef = useRef<string>('');

  const { setupMicrophone, microphone, startMicrophone, stopMicrophone, microphoneState } = useMicrophoneRecorder({
    onError: options.onError,
  });

  // Track if microphone has been started to avoid duplicate starts
  const hasMicStartedRef = useRef(false);

  // Update ref when callback changes
  useEffect(() => {
    onCommittedTranscriptRef.current = options.onCommittedTranscript;
  }, [options.onCommittedTranscript]);

  // Establish connection to ElevenLabs Scribe with provided options
  const connectToElevenLabs = useCallback(
    async (connectOptions: ElevenLabsConnectionOptions = {}) => {
      try {
        setIsLoadingToken(true);
        setTokenError(false);
        const token = await options.getToken();
        setIsLoadingToken(false);

        // Disconnect existing connection before creating new one
        if (connection) {
          connection.close();
        }

        // Build WebSocket URL
        const wsUrl = 'wss://api.elevenlabs.io/v1/scribe/stream';
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          // Send initial configuration
          ws.send(
            JSON.stringify({
              type: 'configure',
              token,
              model_id: connectOptions.modelId || 'scribe_v2_realtime',
              language_code: connectOptions.languageCode || 'en',
              include_timestamps: connectOptions.includeTimestamps ?? false,
            }),
          );
          setIsConnected(true);
        };

        ws.onclose = () => {
          setIsConnected(false);
        };

        ws.onerror = (error) => {
          setIsConnected(false);
          options.onError?.(error);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'transcript' && data.text) {
              partialTranscriptRef.current = data.text;
            }
            if (data.type === 'committed_transcript' && data.text) {
              setIsCommitting(false);
              if (onCommittedTranscriptRef.current) {
                onCommittedTranscriptRef.current({ text: data.text });
              }
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
        setIsConnected(false);
        throw error;
      }
    },
    [connection, options],
  );

  // Start recording: setup microphone
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
      if (connection && partialTranscriptRef.current) {
        setIsCommitting(true);
        connection.send(JSON.stringify({ type: 'commit' }));
        // Wait a bit for the commit callback to fire
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (connection) {
        connection.close();
      }
      setIsConnected(false);
    } catch (error) {
      options.onError?.(error);
      // Still disconnect even if commit fails
      if (connection) {
        connection.close();
      }
      setIsConnected(false);
    }
    stopMicrophone();
    hasMicStartedRef.current = false;
    partialTranscriptRef.current = '';
  }, [connection, stopMicrophone, options]);

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
      if (connection) {
        connection.close();
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
