import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';
import { addToQueue } from '../services/queueService';

const logger = createLogger('webhook-controller');

export const processWebhook = async (req: Request, res: Response) => {
  try {
    const eventType = req.body.type as string;
    const payload = req.body;

    logger.info(`Received webhook event: ${eventType}`);
    logger.info(`Webhook payload: ${JSON.stringify(payload)}`);
    
    await addToQueue(eventType, payload);
    
    res.status(200).json({ status: 'queued' });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};

export const processOpportunityWebhook = async (req: Request, res: Response) => {
  try {
    const eventType = req.body.type as string;
    const payload = req.body;

    if (eventType !== 'opportunity.created') {
      logger.warn(`Received unexpected event type on opportunity webhook: ${eventType}`);
      return res.status(400).json({ error: 'Invalid event type for opportunity webhook' });
    }

    logger.info(`Received opportunity webhook event: ${eventType}`);
    logger.info(`Opportunity webhook payload: ${JSON.stringify(payload)}`);
    
    await addToQueue(eventType, payload);
    
    res.status(200).json({ status: 'queued' });
  } catch (error) {
    logger.error('Error processing opportunity webhook:', error);
    res.status(500).json({ error: 'Failed to process opportunity webhook' });
  }
};

