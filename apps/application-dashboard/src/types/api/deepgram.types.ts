export interface GenerateDeepgramAccessTokenRequest {
  ttl_seconds?: number;
}

export interface GenerateDeepgramAccessTokenResponse {
  access_token: string;
  expires_in: number;
}
