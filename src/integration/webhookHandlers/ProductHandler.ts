import { WebhookEventHandler, WebhookEvent } from '../WebhookHandler';
import { RedisQueue } from '../RedisQueue';

export class ProductCreatedHandler implements WebhookEventHandler {
  private redisQueue: RedisQueue;
  constructor(redisQueue: RedisQueue) {
    this.redisQueue = redisQueue;
  }
  async handleEvent(event: WebhookEvent): Promise<void> {
    console.log('ProductCreatedHandler received event:', event);
    await this.redisQueue.enqueue('product_created_events', JSON.stringify(event));
  }
}

export class ProductPaidHandler implements WebhookEventHandler {
  private redisQueue: RedisQueue;
  constructor(redisQueue: RedisQueue) {
    this.redisQueue = redisQueue;
  }
  async handleEvent(event: WebhookEvent): Promise<void> {
    console.log('ProductPaidHandler received event:', event);
    await this.redisQueue.enqueue('product_paid_events', JSON.stringify(event));
  }
}
