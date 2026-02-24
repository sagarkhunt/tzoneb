import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cacheKey';
export const CACHE_TTL_METADATA = 'cacheTTL';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
