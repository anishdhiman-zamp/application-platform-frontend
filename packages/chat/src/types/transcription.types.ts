import { MicrophoneState } from '../hooks/useMicrophoneRecorder';

export enum SpeechToTextProvider {
  DEEPGRAM = 'deepgram',
  ELEVENLABS = 'elevenlabs',
}

export interface TranscriptionOptions {
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
  getDeepgramToken?: () => Promise<string>;
  getElevenLabsToken?: () => Promise<string>;
  onError?: (error: unknown) => void;
}

// Socket states matching @deepgram/sdk SOCKET_STATES
export const SOCKET_STATES = {
  connecting: 0,
  open: 1,
  closing: 2,
  closed: 3,
} as const;

export type SocketState = (typeof SOCKET_STATES)[keyof typeof SOCKET_STATES];
