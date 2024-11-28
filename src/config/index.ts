export const config = {
  port: process.env.PORT || 3000,
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET || '',
  rabbitmqUrl: process.env.RABBITMQ_URL || '',
  queueName: process.env.QUEUE_NAME || 'webhook-events',
  opportunityQueueName: process.env.OPPORTUNITY_QUEUE_NAME || 'opportunity',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes in milliseconds
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
};

