import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('signature-validator');

export const validateWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  const payloadString = (req as any).rawBody;
  const headerPayload = req.headers;

  const webhook = new Webhook(config.clerkWebhookSecret);

  try {
    webhook.verify(payloadString, headerPayload as Record<string, string>);
    logger.info('Webhook signature verified');
    next();
  } catch (err) {
    logger.error('Invalid webhook signature', err);
    res.status(401).json({ error: 'Invalid signature' });
  }
};

