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

