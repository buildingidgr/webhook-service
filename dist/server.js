"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const webhook_1 = require("./routes/webhook");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const queueService_1 = require("./services/queueService");
(0, dotenv_1.config)(); // Load environment variables
const app = (0, express_1.default)();
const logger = (0, logger_1.createLogger)('webhook-service');
const port = process.env.PORT || 3000;
// Trust proxy
app.set('trust proxy', 1);
// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        // Store raw body for signature verification
        req.rawBody = buf.toString();
    }
}));
app.use(rateLimiter_1.rateLimiter);
// Routes
app.use('/webhook', webhook_1.webhookRouter);
// Error handling
app.use(errorHandler_1.errorHandler);
// Start the server and queue consumer
const startServer = async () => {
    try {
        const server = app.listen(port, () => {
            logger.info(`Webhook service listening on port ${port}`);
        });
        // Graceful shutdown
        const shutdown = async () => {
            logger.info('Shutting down gracefully...');
            server.close(async () => {
                await (0, queueService_1.closeQueueConnection)();
                process.exit(0);
            });
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
