"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEvent = void 0;
const logger_1 = require("../utils/logger");
const apiKeyService_1 = require("./apiKeyService");
const logger = (0, logger_1.createLogger)('event-processor');
const processEvent = async (eventType, payload) => {
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
exports.processEvent = processEvent;
async function handleUserCreated(payload) {
    try {
        const userId = payload.data.id;
        const apiKey = await (0, apiKeyService_1.generateApiKey)(userId);
        logger.info(`Generated API key for user: ${userId}`);
        // Here you would typically store the API key securely
        // For this example, we'll just log it
        logger.info(`API key for user ${userId}: ${apiKey}`);
    }
    catch (error) {
        logger.error('Error handling user.created event:', error);
        throw error;
    }
}
async function handleOpportunityCreated(payload) {
    try {
        const { id, projectType, project, contact, metadata } = payload.data;
        logger.info(`New opportunity created: ${id}`);
        logger.info(`Project Type: ${projectType}`);
        logger.info(`Client: ${contact.fullName}`);
        logger.info(`Location: ${project.location.address}`);
        logger.info(`Submitted At: ${metadata.submittedAt}`);
        // Here you would typically process the opportunity data
        logger.info(`Opportunity details: ${JSON.stringify(payload.data)}`);
    }
    catch (error) {
        logger.error('Error handling opportunity.created event:', error);
        throw error;
    }
}
async function handleSessionCreated(payload) {
    try {
        const { id: sessionId, user_id: userId, client_id: clientId } = payload.data;
        const { user_agent: userAgent, client_ip: clientIp } = payload.event_attributes.http_request;
        logger.info(`New session created: ${sessionId}`);
        logger.info(`User: ${userId}, Client: ${clientId}`);
        logger.info(`User Agent: ${userAgent}`);
        logger.info(`Client IP: ${clientIp}`);
    }
    catch (error) {
        logger.error('Error handling session.created event:', error);
        throw error;
    }
}
async function handleSessionEnded(payload) {
    try {
        const { id: sessionId, user_id: userId, last_active_at } = payload.data;
        logger.info(`Session ended: ${sessionId}`);
        logger.info(`User: ${userId}`);
        logger.info(`Last active at: ${new Date(last_active_at).toISOString()}`);
    }
    catch (error) {
        logger.error('Error handling session.ended event:', error);
        throw error;
    }
}
async function handleSessionRemoved(payload) {
    try {
        const { id: sessionId, user_id: userId } = payload.data;
        logger.info(`Session removed: ${sessionId}`);
        logger.info(`User: ${userId}`);
    }
    catch (error) {
        logger.error('Error handling session.removed event:', error);
        throw error;
    }
}
async function handleSessionRevoked(payload) {
    try {
        const { id: sessionId, user_id: userId, client_id: clientId } = payload.data;
        logger.info(`Session revoked: ${sessionId}`);
        logger.info(`User: ${userId}, Client: ${clientId}`);
    }
    catch (error) {
        logger.error('Error handling session.revoked event:', error);
        throw error;
    }
}
