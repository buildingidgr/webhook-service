import amqp from 'amqplib';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('queue-service');

let channel: amqp.Channel;

async function getChannel() {
  if (!channel) {
    const connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(config.queueName, { durable: true });
  }
  return channel;
}

export async function addToQueue(eventType: string, data: any) {
  try {
    const ch = await getChannel();
    const message = JSON.stringify({ eventType, data });
    ch.sendToQueue(config.queueName, Buffer.from(message));
    logger.info(`Added to queue: ${eventType}`);
  } catch (error) {
    logger.error('Error adding to queue:', error);
    throw error;
  }
}

export async function startQueueConsumer(processMessage: (eventType: string, data: any) => Promise<void>) {
  try {
    const ch = await getChannel();
    ch.consume(config.queueName, async (msg) => {
      if (msg) {
        const { eventType, data } = JSON.parse(msg.content.toString());
        try {
          await processMessage(eventType, data);
          ch.ack(msg);
        } catch (error) {
          logger.error(`Error processing message: ${eventType}`, error);
          ch.nack(msg, false, false);
        }
      }
    });
    logger.info('Queue consumer started');
  } catch (error) {
    logger.error('Error starting queue consumer:', error);
    throw error;
  }
}

