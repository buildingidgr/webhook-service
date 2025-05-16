"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToQueue = addToQueue;
exports.bindOpportunityQueue = bindOpportunityQueue;
exports.closeQueueConnection = closeQueueConnection;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('queue-service');
let channel;
let connection;
const OPPORTUNITY_EXCHANGE = 'opportunity.events';
async function getChannel() {
    if (!channel) {
        connection = await new Promise((resolve, reject) => {
            callback_api_1.default.connect(config_1.config.rabbitmqUrl, (err, conn) => {
                if (err)
                    reject(err);
                else
                    resolve(conn);
            });
        });
        channel = await new Promise((resolve, reject) => {
            connection.createChannel((err, ch) => {
                if (err)
                    reject(err);
                else
                    resolve(ch);
            });
        });
        // Assert existing queues for backward compatibility
        await channel.assertQueue(config_1.config.queueName, { durable: true });
        await channel.assertQueue(config_1.config.opportunityQueueName, { durable: true });
        await channel.assertQueue(config_1.config.sessionQueueName, { durable: true });
        // Set up the topic exchange for opportunities
        await channel.assertExchange(OPPORTUNITY_EXCHANGE, 'topic', { durable: true });
        // Bind the existing opportunity queue to the exchange for backward compatibility
        await channel.bindQueue(config_1.config.opportunityQueueName, OPPORTUNITY_EXCHANGE, 'opportunity.#');
    }
    return channel;
}
async function addToQueue(eventType, data) {
    try {
        const ch = await getChannel();
        const message = Buffer.from(JSON.stringify({ eventType, data }));
        let result = true;
        if (eventType === 'opportunity.created') {
            // Publish to the topic exchange
            result = ch.publish(OPPORTUNITY_EXCHANGE, eventType, message, { persistent: true });
            logger.info(`Published to exchange: ${OPPORTUNITY_EXCHANGE}, Event Type: ${eventType}, Result: ${result}`);
        }
        else if (eventType.startsWith('session.')) {
            result = ch.sendToQueue(config_1.config.sessionQueueName, message, { persistent: true });
            logger.info(`Added to queue: ${config_1.config.sessionQueueName}, Event Type: ${eventType}, Result: ${result}`);
        }
        else {
            result = ch.sendToQueue(config_1.config.queueName, message, { persistent: true });
            logger.info(`Added to queue: ${config_1.config.queueName}, Event Type: ${eventType}, Result: ${result}`);
        }
        logger.info(`Message content: ${JSON.stringify({ eventType, data })}`);
        return result;
    }
    catch (error) {
        logger.error('Error adding to queue:', error);
        throw error;
    }
}
// Helper function to bind a new queue to the opportunity exchange
async function bindOpportunityQueue(queueName, routingPattern = 'opportunity.#') {
    try {
        const ch = await getChannel();
        await ch.assertQueue(queueName, { durable: true });
        await ch.bindQueue(queueName, OPPORTUNITY_EXCHANGE, routingPattern);
        logger.info(`Bound queue ${queueName} to exchange ${OPPORTUNITY_EXCHANGE} with pattern ${routingPattern}`);
    }
    catch (error) {
        logger.error(`Error binding queue ${queueName} to exchange:`, error);
        throw error;
    }
}
async function getQueueSize(queueName) {
    const ch = await getChannel();
    return new Promise((resolve, reject) => {
        ch.assertQueue(queueName, { durable: true }, (err, ok) => {
            if (err)
                reject(err);
            else
                resolve(ok.messageCount);
        });
    });
}
async function closeQueueConnection() {
    try {
        if (channel) {
            await new Promise((resolve, reject) => {
                channel.close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
        if (connection) {
            await new Promise((resolve, reject) => {
                connection.close((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
        logger.info('Queue connection closed');
    }
    catch (error) {
        logger.error('Error closing queue connection:', error);
        throw error;
    }
}
