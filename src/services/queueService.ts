import amqp, { Channel, Connection } from 'amqplib';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('queue-service');

let channel: Channel;
let connection: Connection;

async function getChannel(): Promise<Channel> {
  if (!channel) {
    connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(config.queueName, { durable: true });
    await channel.assertQueue(config.opportunityQueueName, { durable: true });
  }
  return channel;
}

export async function addToQueue(eventType: string, data: any): Promise<boolean> {
  try {
    const ch = await getChannel();
    const message = Buffer.from(JSON.stringify({ eventType, data }));
    let queueName = config.queueName;

    if (eventType === 'opportunity.created') {
      queueName = config.opportunityQueueName;
    }

    const result = ch.sendToQueue(queueName, message, { persistent: true });
    logger.info(`Added to queue: ${queueName}, Event Type: ${eventType}, Result: ${result}`);
    logger.info(`Message content: ${JSON.stringify({ eventType, data })}`);
    return result;
  } catch (error) {
    logger.error('Error adding to queue:', error);
    throw error;
  }
}

async function getQueueSize(queueName: string): Promise<number> {
  const ch = await getChannel();
  const queueInfo = await ch.assertQueue(queueName, { durable: true });
  return queueInfo.messageCount;
}

export async function closeQueueConnection(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    logger.info('Queue connection closed');
  } catch (error) {
    logger.error('Error closing queue connection:', error);
    throw error;
  }
}

