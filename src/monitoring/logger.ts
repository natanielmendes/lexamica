import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Placeholder for correlation ID support
export function withCorrelationId(id: string) {
  // In a real implementation, attach correlation ID to logs
  return logger;
}
