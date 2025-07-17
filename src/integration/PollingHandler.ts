import { Adapter } from './Adapter';
import { RedisQueue } from './RedisQueue';
import { RetryStrategy } from './RetryStrategy';

export class PollingHandler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;
  private readonly fetchFn: () => Promise<any[]>;
  private readonly adapter: Adapter;
  private readonly queueName: string;
  private readonly redisQueue: RedisQueue;

  constructor({
    intervalMs,
    fetchFn,
    adapter,
    queueName,
    redisQueue,
  }: {
    intervalMs: number;
    fetchFn: () => Promise<any[]>;
    adapter: Adapter;
    queueName: string;
    redisQueue: RedisQueue;
  }) {
    this.intervalMs = intervalMs;
    this.fetchFn = fetchFn;
    this.adapter = adapter;
    this.queueName = queueName;
    this.redisQueue = redisQueue;
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(async () => {
      try {
        const rawData = await RetryStrategy.execute(
          () => this.fetchFn(),
          {
            maxRetries: 3,
            strategy: 'exponential',
            strategyOptions: { initialDelay: 1000, backoffFactor: 2 },
          }
        );
        for (const item of rawData) {
          const normalized = this.adapter.normalize(item);
          await this.redisQueue.enqueue(this.queueName, JSON.stringify(normalized));
        }
      } catch (err) {
        console.error('PollingHandler error:', err);
      }
    }, this.intervalMs);
    console.log(`Polling started for queue ${this.queueName} every ${this.intervalMs}ms`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log(`Polling stopped for queue ${this.queueName}`);
    }
  }
}
