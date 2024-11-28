import { Router } from 'express';
import { validateWebhookSignature } from '../middleware/signatureValidator';
import { processWebhook, processOpportunityWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/clerk', validateWebhookSignature, processWebhook);
router.post('/opportunity', processOpportunityWebhook);

export const webhookRouter = router;

