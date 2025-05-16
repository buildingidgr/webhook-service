"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("../config");
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimitWindow,
    max: config_1.config.rateLimitMax,
    message: 'Too many requests, please try again later.',
});
