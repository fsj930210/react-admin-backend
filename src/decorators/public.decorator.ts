import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = Symbol('__public__');

/**
 * 不需要登录
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
