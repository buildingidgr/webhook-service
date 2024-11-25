import Queue from 'bull';
import { config } from '../config';
import { createLogger } from '../utils/logger';
import { generateApiKey } from '../services/apiKeyService';

const logger = createLogger('bull-queue');

const webhookQueue = new Queue(config.bullQueueName, config.redisUrl);

export async function addToQueue(eventType: string, data: any) {
  await webhookQueue.add({ eventType, data });
}

webhookQueue.process(async (job) => {
  const { eventType, data } = job.data;
  logger.info(`Processing job: ${eventType}`);

  switch (eventType) {
    case 'user.api_key.created':
      await generateApiKey(data.userId);
      break;
    default:
      logger.warn(`Unhandled job type: ${eventType}`);
  }
});

webhookQueue.on('completed', (job) => {
  logger.info(`Job completed: ${job.id}`);
});

webhookQueue.on('failed', (job, err) => {
  logger.error(`Job failed: ${job.id}`, err);
});

