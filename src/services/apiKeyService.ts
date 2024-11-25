import crypto from 'crypto';
import { createLogger } from '../utils/logger';

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

    // In a real-world scenario, you would store this securely
    // For this example, we'll just log it
    logger.info(`Generated API key for user: ${userId}`);
    logger.info(`Hashed API key: ${hashedKey}`);

    return apiKey;
  } catch (error) {
    logger.error('Error generating API key:', error);
    throw error;
  }
};

