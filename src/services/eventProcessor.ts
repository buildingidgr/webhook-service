import { createLogger } from '../utils/logger';
import { generateApiKey } from './apiKeyService';
import { addToQueue } from '../queue/bullQueue';

const logger = createLogger('event-processor');

export const processEvent = async (eventType: string, payload: any) => {
  logger.info(`Processing event: ${eventType}`);

  switch (eventType) {
    case 'user.created':
      await handleUserCreated(payload);
      break;
    // Add more event handlers as needed
    default:
      logger.warn(`Unhandled event type: ${eventType}`);
  }
};

async function handleUserCreated(payload: any) {
  try {
    const userId = payload.data.id;
    await addToQueue('user.api_key.created', { userId });
    logger.info(`Added API key generation job to queue for user: ${userId}`);
  } catch (error) {
    logger.error('Error handling user.created event:', error);
    throw error;
  }
}

