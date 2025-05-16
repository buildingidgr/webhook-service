"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWebhookSignature = void 0;
const svix_1 = require("svix");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('signature-validator');
const validateWebhookSignature = (req, res, next) => {
    const payloadString = req.rawBody;
    const headerPayload = req.headers;
    const webhook = new svix_1.Webhook(config_1.config.clerkWebhookSecret);
    try {
        webhook.verify(payloadString, headerPayload);
        logger.info('Webhook signature verified');
        next();
    }
    catch (err) {
        logger.error('Invalid webhook signature', err);
        res.status(401).json({ error: 'Invalid signature' });
    }
};
exports.validateWebhookSignature = validateWebhookSignature;
