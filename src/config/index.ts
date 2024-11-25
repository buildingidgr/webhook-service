export const config = {
  port: process.env.PORT || 3000,
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET || '',
  mongodbUri: process.env.MONGODB_URI || '',
  redisUrl: process.env.REDIS_URL || '',
  bullQueueName: 'webhook-events',
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100,
};

