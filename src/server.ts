import express from 'express';
import { config } from 'dotenv';
import { webhookRouter } from './routes/webhook';
import { errorHandler } from './middleware/errorHandler';
import { createLogger } from './utils/logger';
import { rateLimiter } from './middleware/rateLimiter';

config(); // Load environment variables

const app = express();
const logger = createLogger('webhook-service');
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({
  verify: (req: any, res, buf) => {
    // Store raw body for signature verification
    req.rawBody = buf;
  }
}));
app.use(rateLimiter);

// Routes
app.use('/webhook', webhookRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Webhook service listening on port ${port}`);
});

