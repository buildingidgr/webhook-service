import amqp, { Channel, Connection } from 'amqplib';
import { config } from '../config';
import { createLogger } from '../utils/logger';
import { processEvent } from './eventProcessor';

const logger = createLogger('queue-service');

let channel: Channel;
let connection: Connection;

async function getChannel(): Promise<Channel> {
  if (!channel) {
    connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(config.queueName, { durable: true });
  }
  return channel;
}

export async function addToQueue(eventType: string, data: any): Promise<boolean> {
  try {
    const ch = await getChannel();
    const message = JSON.stringify({ eventType, data });
    const result = ch.sendToQueue(config.queueName, Buffer.from(message), { persistent: true });
    logger.info(`Added to queue: ${eventType}, Result: ${result}`);
    return result;
  } catch (error) {
    logger.error('Error adding to queue:', error);
    throw error;
  }
}

export async function setupQueueConsumer(): Promise<void> {
  try {
    const ch = await getChannel();
    const queueInfo = await ch.assertQueue(config.queueName, { durable: true });
    logger.info(`Queue setup: ${JSON.stringify(queueInfo)}`);
    
    ch.consume(config.queueName, async (msg) => {
      if (msg) {
        const { eventType, data } = JSON.parse(msg.content.toString());
        logger.info(`Received message: ${eventType}`);
        try {
          await processEvent(eventType, data);
          ch.ack(msg);
          logger.info(`Processed and acknowledged: ${eventType}`);
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

// Graceful shutdown function
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

