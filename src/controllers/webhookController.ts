import { Request, Response } from 'express';
import { createLogger } from '../utils/logger';
import { addToQueue } from '../services/queueService';
import { OpportunityPayload } from '../types/opportunity';
import crypto from 'crypto';

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
    // Log the incoming request for debugging
    logger.info(`Received raw request body: ${JSON.stringify(req.body)}`);
    
    // Extract the opportunity data from the payload
    let opportunityData: OpportunityPayload;
    
    try {
      // Parse the payload
      opportunityData = req.body;
    } catch (parseError) {
      logger.error('Failed to parse payload:', parseError);
      throw new Error('Invalid JSON payload');
    }

    // Validate the payload structure
    if (!opportunityData?.project?.category?.title) {
      logger.error('Invalid payload structure:', JSON.stringify(opportunityData));
      throw new Error('Invalid payload structure');
    }

    // Transform the payload to match the queue message format
    const queuePayload = {
      type: 'opportunity.created',
      data: {
        id: crypto.randomUUID(),
        projectType: opportunityData.project.category.title,
        project: opportunityData.project,
        contact: opportunityData.contact,
        metadata: opportunityData.metadata
      }
    };

    logger.info(`Processed opportunity payload: ${JSON.stringify(queuePayload)}`);
    
    await addToQueue('opportunity.created', queuePayload);
    
    res.status(200).json({ status: 'queued' });
  } catch (error: unknown) {
    logger.error('Error processing opportunity webhook:', error);
    logger.error('Request body:', JSON.stringify(req.body));
    res.status(500).json({ 
      error: 'Failed to process opportunity webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

