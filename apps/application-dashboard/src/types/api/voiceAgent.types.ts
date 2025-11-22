export interface GenerateSpeechToTextAccessTokenRequest {
  ttl_seconds?: number;
}

export interface GenerateSpeechToTextAccessTokenResponse {
  access_token: string;
  expires_in: number;
}

export enum SpeechToTextProvider {
  DEEPGRAM = 'deepgram',
  ELEVENLABS = 'elevenlabs',
}
