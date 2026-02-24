export interface OAuthPayload {
  id: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  type: 'refresh';
  jti: string;
}
