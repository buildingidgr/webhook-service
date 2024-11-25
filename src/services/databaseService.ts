import { MongoClient } from 'mongodb';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('database-service');
let client: MongoClient;

async function getClient() {
  if (!client) {
    client = new MongoClient(config.mongodbUri);
    await client.connect();
  }
  return client;
}

export async function storeApiKey(userId: string, hashedKey: string) {
  try {
    const client = await getClient();
    const db = client.db('mechub');
    const collection = db.collection('api_keys');

    await collection.updateOne(
      { userId },
      { $set: { hashedKey, createdAt: new Date() } },
      { upsert: true }
    );

    logger.info(`Stored API key for user: ${userId}`);
  } catch (error) {
    logger.error('Error storing API key:', error);
    throw error;
  }
}

