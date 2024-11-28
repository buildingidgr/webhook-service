import { createLogger } from '../utils/logger';
import { generateApiKey } from './apiKeyService';

const logger = createLogger('event-processor');

export const processEvent = async (eventType: string, payload: any) => {
  logger.info(`Processing event: ${eventType}`);

  switch (eventType) {
    case 'user.created':
      await handleUserCreated(payload);
      break;
    case 'opportunity.created':
      await handleOpportunityCreated(payload);
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

async function handleOpportunityCreated(payload: any) {
  try {
    const opportunityId = payload.data.id;
    const projectType = payload.data.projectType;
    const clientName = payload.data.client.fullName;
    
    logger.info(`New opportunity created: ${opportunityId}`);
    logger.info(`Project Type: ${projectType}`);
    logger.info(`Client: ${clientName}`);
    
    // Here you would typically process the opportunity data
    // For this example, we'll just log some information
    logger.info(`Opportunity details: ${JSON.stringify(payload.data)}`);
  } catch (error) {
    logger.error('Error handling opportunity.created event:', error);
    throw error;
  }
}

