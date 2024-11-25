import crypto from 'crypto';
import { createLogger } from '../utils/logger';
import { storeApiKey } from './databaseService';
import { cacheApiKey } from './cacheService';

const logger = createLogger('api-key-service');

export const generateApiKey = async (userId: string): Promise<string> => {
  try {
    const prefix = 'mk';
    const random = crypto.randomBytes(24).toString('base64url');
    const apiKey = `${prefix}_${random}`;
    
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    await storeApiKey(userId, hashedKey);
    await cacheApiKey(userId, hashedKey);

    logger.info(`Generated API key for user: ${userId}`);
    return apiKey;
  } catch (error) {
    logger.error('Error generating API key:', error);
    throw error;
  }
};

