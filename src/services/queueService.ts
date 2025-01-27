import amqp, { Channel, Connection } from 'amqplib';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('queue-service');

let channel: Channel;
let connection: Connection;

const OPPORTUNITY_EXCHANGE = 'opportunity.events';

async function getChannel(): Promise<Channel> {
  if (!channel) {
    connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    
    // Assert existing queues for backward compatibility
    await channel.assertQueue(config.queueName, { durable: true });
    await channel.assertQueue(config.opportunityQueueName, { durable: true });
    await channel.assertQueue(config.sessionQueueName, { durable: true });
    
    // Set up the topic exchange for opportunities
    await channel.assertExchange(OPPORTUNITY_EXCHANGE, 'topic', { durable: true });
    
    // Bind the existing opportunity queue to the exchange for backward compatibility
    await channel.bindQueue(config.opportunityQueueName, OPPORTUNITY_EXCHANGE, 'opportunity.#');
  }
  return channel;
}

export async function addToQueue(eventType: string, data: any): Promise<boolean> {
  try {
    const ch = await getChannel();
    const message = Buffer.from(JSON.stringify({ eventType, data }));
    let result = true;

    if (eventType === 'opportunity.created') {
      // Publish to the topic exchange
      result = ch.publish(OPPORTUNITY_EXCHANGE, eventType, message, { persistent: true });
      logger.info(`Published to exchange: ${OPPORTUNITY_EXCHANGE}, Event Type: ${eventType}, Result: ${result}`);
    } else if (eventType.startsWith('session.')) {
      result = ch.sendToQueue(config.sessionQueueName, message, { persistent: true });
      logger.info(`Added to queue: ${config.sessionQueueName}, Event Type: ${eventType}, Result: ${result}`);
    } else {
      result = ch.sendToQueue(config.queueName, message, { persistent: true });
      logger.info(`Added to queue: ${config.queueName}, Event Type: ${eventType}, Result: ${result}`);
    }

    logger.info(`Message content: ${JSON.stringify({ eventType, data })}`);
    return result;
  } catch (error) {
    logger.error('Error adding to queue:', error);
    throw error;
  }
}

// Helper function to bind a new queue to the opportunity exchange
export async function bindOpportunityQueue(queueName: string, routingPattern: string = 'opportunity.#'): Promise<void> {
  try {
    const ch = await getChannel();
    await ch.assertQueue(queueName, { durable: true });
    await ch.bindQueue(queueName, OPPORTUNITY_EXCHANGE, routingPattern);
    logger.info(`Bound queue ${queueName} to exchange ${OPPORTUNITY_EXCHANGE} with pattern ${routingPattern}`);
  } catch (error) {
    logger.error(`Error binding queue ${queueName} to exchange:`, error);
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

