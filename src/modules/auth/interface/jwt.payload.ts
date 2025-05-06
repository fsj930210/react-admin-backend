export interface JwtPayload {
  sub: {
    userId: number;
    username: string;
    type: 'access_token' | 'refresh_token';
  };
  jti: string;
}
