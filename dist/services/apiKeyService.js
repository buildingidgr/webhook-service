"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('api-key-service');
const generateApiKey = async (userId) => {
    try {
        const prefix = 'mk';
        const random = crypto_1.default.randomBytes(24).toString('base64url');
        const apiKey = `${prefix}_${random}`;
        const hashedKey = crypto_1.default
            .createHash('sha256')
            .update(apiKey)
            .digest('hex');
        // In a real-world scenario, you would store this securely
        // For this example, we'll just log it
        logger.info(`Generated API key for user: ${userId}`);
        logger.info(`Hashed API key: ${hashedKey}`);
        return apiKey;
    }
    catch (error) {
        logger.error('Error generating API key:', error);
        throw error;
    }
};
exports.generateApiKey = generateApiKey;
