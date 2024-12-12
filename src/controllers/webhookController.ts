import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';
import { addToQueue } from '../services/queueService';
import { OpportunityPayload } from '../types/opportunity';

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
    const payload = req.body as OpportunityPayload;
    
    // Transform the payload to match the queue message format
    const queuePayload = {
      type: 'opportunity.created',
      data: {
        id: crypto.randomUUID(), // Generate a unique ID
        projectType: payload.project.category.title,
        client: {
          fullName: payload.contact.fullName,
          email: payload.contact.email
        },
        project: payload.project,
        contact: payload.contact,
        metadata: payload.metadata
      }
    };

    logger.info(`Received opportunity webhook`);
    logger.info(`Opportunity payload: ${JSON.stringify(queuePayload)}`);
    
    await addToQueue('opportunity.created', queuePayload);
    
    res.status(200).json({ status: 'queued' });
  } catch (error) {
    logger.error('Error processing opportunity webhook:', error);
    res.status(500).json({ error: 'Failed to process opportunity webhook' });
  }
};

