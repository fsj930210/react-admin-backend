import { SetMetadata } from '@nestjs/common';

export const KEEP_KEY = Symbol('__keep_key__');

/**
 * 不转化成JSON结构，保留原有返回
 */
export function Keep() {
  return SetMetadata(KEEP_KEY, true);
}
