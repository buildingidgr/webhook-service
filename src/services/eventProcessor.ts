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
    case 'session.created':
      await handleSessionCreated(payload);
      break;
    case 'session.ended':
      await handleSessionEnded(payload);
      break;
    case 'session.removed':
      await handleSessionRemoved(payload);
      break;
    case 'session.revoked':
      await handleSessionRevoked(payload);
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

async function handleSessionCreated(payload: any) {
  try {
    const { id: sessionId, user_id: userId, client_id: clientId } = payload.data;
    const { user_agent: userAgent, client_ip: clientIp } = payload.event_attributes.http_request;

    logger.info(`New session created: ${sessionId}`);
    logger.info(`User: ${userId}, Client: ${clientId}`);
    logger.info(`User Agent: ${userAgent}`);
    logger.info(`Client IP: ${clientIp}`);
  } catch (error) {
    logger.error('Error handling session.created event:', error);
    throw error;
  }
}

async function handleSessionEnded(payload: any) {
  try {
    const { id: sessionId, user_id: userId, last_active_at } = payload.data;

    logger.info(`Session ended: ${sessionId}`);
    logger.info(`User: ${userId}`);
    logger.info(`Last active at: ${new Date(last_active_at).toISOString()}`);
  } catch (error) {
    logger.error('Error handling session.ended event:', error);
    throw error;
  }
}

async function handleSessionRemoved(payload: any) {
  try {
    const { id: sessionId, user_id: userId } = payload.data;

    logger.info(`Session removed: ${sessionId}`);
    logger.info(`User: ${userId}`);
  } catch (error) {
    logger.error('Error handling session.removed event:', error);
    throw error;
  }
}

async function handleSessionRevoked(payload: any) {
  try {
    const { id: sessionId, user_id: userId, client_id: clientId } = payload.data;

    logger.info(`Session revoked: ${sessionId}`);
    logger.info(`User: ${userId}, Client: ${clientId}`);
  } catch (error) {
    logger.error('Error handling session.revoked event:', error);
    throw error;
  }
}

