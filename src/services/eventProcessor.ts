import { createLogger } from '../utils/logger';
import { generateApiKey } from './apiKeyService';
import { addToQueue } from './queueService';

const logger = createLogger('event-processor');

export const processEvent = async (eventType: string, payload: any) => {
  logger.info(`Processing event: ${eventType}`);

  switch (eventType) {
    case 'user.created':
      await handleUserCreated(payload);
      break;
    default:
      logger.warn(`Unhandled event type: ${eventType}`);
  }
};

async function handleUserCreated(payload: any) {
  try {
    const userId = payload.data.id;
    const apiKey = await generateApiKey(userId);
    logger.info(`Generated API key for user: ${userId}`);
    // Here you would typically store the API key securely
    // For this example, we'll just log it
    logger.info(`API key for user ${userId}: ${apiKey}`);
  } catch (error) {
    logger.error('Error handling user.created event:', error);
    throw error;
  }
}

