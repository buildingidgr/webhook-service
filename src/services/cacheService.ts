import Redis from 'ioredis';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('cache-service');
const redis = new Redis(config.redisUrl);

export async function cacheApiKey(userId: string, hashedKey: string) {
  try {
    await redis.set(`api_key:${userId}`, hashedKey, 'EX', 3600); // Cache for 1 hour
    logger.info(`Cached API key for user: ${userId}`);
  } catch (error) {
    logger.error('Error caching API key:', error);
    throw error;
  }
}

