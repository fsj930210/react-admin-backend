export const AUTH_STRATEGY = {
  JWT: 'jwt',
  GOOGLE: 'google',
  GITHUB: 'github',
  LOCAL: 'local',
};

// redis key prefix
export const ACCESS_TOKEN_REDIS_KEY_PRFIX = 'access_token:';
export const REFRESH_TOKEN_REDIS_KEY_PREFIX = 'refresh_token:';
export const CAPTCHA_REDIS_KEY_PREFIX = 'captcha:';
export const TOKEN_BLACKLIST_KEY_PREFIX = 'token_blacklist:';
// jwt id
export const JTI_KEY_PREFIX = 'jti:';
