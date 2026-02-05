import { MicrophoneState } from '../hooks/useMicrophoneRecorder';

export interface TranscriptionOptions {
  modelId?: string;
  languageCode?: string;
  includeTimestamps?: boolean;
}

export interface UseTranscriptionReturn {
  transcript: string;
  isRecording: boolean;
  startRecording: (options?: TranscriptionOptions) => Promise<void>;
  stopRecording: () => void | Promise<void>;
  microphone: MediaRecorder | null;
  microphoneState: MicrophoneState | null;
  connectionState: number;
  isCommitting: boolean;
}

export interface TranscriptionAdapter {
  getElevenLabsToken?: () => Promise<string>;
  onError?: (error: unknown) => void;
}

export const SOCKET_STATES = {
  connecting: 0,
  open: 1,
  closing: 2,
  closed: 3,
} as const;

export type SocketState = (typeof SOCKET_STATES)[keyof typeof SOCKET_STATES];
