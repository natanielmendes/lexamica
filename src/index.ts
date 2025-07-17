import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import winston from 'winston';
import productsRouter from './api/products';
// Integration and config scaffolding
import { IntegrationManager } from './integration/IntegrationManager';
import { ConfigManager } from './config/ConfigManager';
import { healthCheckRouter } from './monitoring/health';
import { RedisQueue } from './integration/RedisQueue';
import { DIContainer } from './integration/DIContainer';

const app = express();
app.use(express.json());

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// MongoDB connection
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', err);
  }
})();

// Redis connection
const redis = new Redis(process.env.REDIS_URL as string);
redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', err => logger.error('Redis connection error', err));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);

// Monitoring endpoint
app.use('/health', healthCheckRouter);

// Integration manager (placeholder)
const configManager = new ConfigManager();
// DI setup
const diContainer = new DIContainer();
// Mount webhook endpoints at /webhook
app.use('/webhook', require('./integration/webhooks').default(diContainer.redisQueue));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
