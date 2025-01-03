import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { webhookRouter } from './routes/webhook';
import { errorHandler } from './middleware/errorHandler';
import { createLogger } from './utils/logger';
import { rateLimiter } from './middleware/rateLimiter';
import { closeQueueConnection } from './services/queueService';

config(); // Load environment variables

const app = express();
const logger = createLogger('webhook-service');
const port = process.env.PORT || 3000;

// Trust proxy
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({
  limit: '10mb',
  verify: (req: any, res, buf) => {
    // Store raw body for signature verification
    req.rawBody = buf.toString();
  }
}));
app.use(rateLimiter);

// Routes
app.use('/webhook', webhookRouter);

// Error handling
app.use(errorHandler);

// Start the server and queue consumer
const startServer = async () => {
  try {
    const server = app.listen(port, () => {
      logger.info(`Webhook service listening on port ${port}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(async () => {
        await closeQueueConnection();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

