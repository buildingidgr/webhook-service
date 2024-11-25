import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';
import { processEvent } from '../services/eventProcessor';

const logger = createLogger('webhook-controller');

export const processWebhook = async (req: Request, res: Response) => {
  try {
    const eventType = req.headers['svix-event-type'] as string;
    const payload = req.body;

    logger.info(`Processing webhook event: ${eventType}`);
    
    await processEvent(eventType, payload);
    
    res.status(200).json({ status: 'processed' });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};

