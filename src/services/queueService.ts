export async function addToQueue(eventType: string, data: any) {
  try {
    const ch = await getChannel();
    const message = JSON.stringify({ eventType, data });
    ch.sendToQueue(config.queueName, Buffer.from(message), { persistent: true });
    logger.info(`Added to queue: ${eventType}`);
  } catch (error) {
    logger.error('Error adding to queue:', error);
    throw error;
  }
}

