export async function addToQueue(eventType: string, data: any) {
  try {
    const ch = await getChannel();
    const message = JSON.stringify({ eventType, data });
    const result = ch.sendToQueue(config.queueName, Buffer.from(message), { persistent: true });
    logger.info(`Added to queue: ${eventType}, Result: ${result}`);
  } catch (error) {
    logger.error('Error adding to queue:', error);
    throw error;
  }
}

export async function setupQueueConsumer() {
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

