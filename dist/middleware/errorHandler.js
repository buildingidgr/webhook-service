"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('error-handler');
const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
};
exports.errorHandler = errorHandler;
