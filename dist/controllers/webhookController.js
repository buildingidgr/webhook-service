"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOpportunityWebhook = exports.processWebhook = void 0;
const logger_1 = require("../utils/logger");
const queueService_1 = require("../services/queueService");
const logger = (0, logger_1.createLogger)('webhook-controller');
const processWebhook = async (req, res) => {
    try {
        const eventType = req.body.type;
        const payload = req.body;
        logger.info(`Received webhook event: ${eventType}`);
        logger.info(`Webhook payload: ${JSON.stringify(payload)}`);
        await (0, queueService_1.addToQueue)(eventType, payload);
        res.status(200).json({ status: 'queued' });
    }
    catch (error) {
        logger.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
};
exports.processWebhook = processWebhook;
const processOpportunityWebhook = async (req, res) => {
    try {
        // Log the incoming request for debugging
        logger.info(`Received raw request body: ${JSON.stringify(req.body)}`);
        // Extract the opportunity data from the payload
        const opportunityData = req.body;
        // Validate the payload structure
        if (!opportunityData?.project?.category) {
            logger.error('Invalid payload structure:', JSON.stringify(opportunityData));
            throw new Error('Invalid payload structure');
        }
        // Transform the payload to match the queue message format
        const queuePayload = {
            type: 'opportunity.created',
            data: {
                project: {
                    ...opportunityData.project,
                    location: {
                        ...opportunityData.project.location,
                        coordinates: {
                            lat: opportunityData.project.location.lat,
                            lng: opportunityData.project.location.lng
                        }
                    }
                },
                contact: opportunityData.contact
            }
        };
        logger.info(`Processed opportunity payload: ${JSON.stringify(queuePayload)}`);
        await (0, queueService_1.addToQueue)('opportunity.created', queuePayload);
        res.status(200).json({ status: 'queued' });
    }
    catch (error) {
        logger.error('Error processing opportunity webhook:', error);
        logger.error('Request body:', JSON.stringify(req.body));
        res.status(500).json({
            error: 'Failed to process opportunity webhook',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.processOpportunityWebhook = processOpportunityWebhook;
