import { Router } from 'express';
import { validateWebhookSignature } from '../middleware/signatureValidator';
import { processWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/clerk',
  validateWebhookSignature,
  processWebhook
);

export const webhookRouter = router;

