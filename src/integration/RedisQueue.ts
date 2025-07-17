import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export class RedisQueue {
  private client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl);

    this.client.on('error', (err) => {
      console.error('Redis connection error', err);
    });
  }

  async enqueue(queueName: string, data: string) {
    await this.client.lpush(queueName, data);
  }

  async dequeue(queueName: string): Promise<string | null> {
    return this.client.rpop(queueName);
  }

  async length(queueName: string): Promise<number> {
    return this.client.llen(queueName);
  }

  async peek(queueName: string): Promise<string | null> {
    const result = await this.client.lindex(queueName, -1);
    return result;
  }
}
