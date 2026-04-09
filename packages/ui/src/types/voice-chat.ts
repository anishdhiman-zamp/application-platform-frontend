import type { ConnectionQuality } from 'livekit-client';

/** Voice session lifecycle (see docs/voice-pipeline-spec.md). */
export const VOICE_CHAT_STATE = {
  Idle: 'idle',
  Connecting: 'connecting',
  Ready: 'ready',
  Active: 'active',
  Error: 'error',
} as const;

export type VoiceChatState = (typeof VOICE_CHAT_STATE)[keyof typeof VOICE_CHAT_STATE];

export interface VoiceJoinRequest {
  transport_type: 'livekit';
  voice_config?: {
    system_prompt?: string;
  };
}

export interface VoiceJoinResponse {
  transport_type: string;
  url: string;
  token: string;
  room_name: string;
  workflow_id: string;
}

export interface VoiceTranscriptMessage {
  type: 'user_transcript' | 'bot_transcript' | string;
  text?: string;
  final?: boolean;
}

export interface UseVoiceChatOptions {
  /** Remote participant identity used to detect bot speech. Default: `bot` */
  botIdentity?: string;
  /** Optional default passed to `start()` when no override is given */
  defaultSystemPrompt?: string;
  /** Fetch LiveKit credentials for the voice session. Required. */
  fetchJoin?: (body: VoiceJoinRequest) => Promise<VoiceJoinResponse>;
}

export interface UseVoiceChatReturn {
  state: VoiceChatState;
  start: (options?: { systemPrompt?: string }) => Promise<void>;
  stop: () => void;
  toggleMic: () => Promise<void>;
  isMicEnabled: boolean;
  isBotSpeaking: boolean;
  connectionQuality: ConnectionQuality | null;
  userTranscript: string;
  botTranscript: string;
  error: Error | null;
  sendUserText: (text: string) => void;
}
