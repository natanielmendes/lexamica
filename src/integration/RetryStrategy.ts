import { SyncStrategyFactory, SyncStrategy } from './SyncStrategyFactory';

export class RetryStrategy {
  /**
   * Retries the given async function with exponential backoff.
   * @param fn The async function to execute.
   * @param options.maxRetries Maximum number of retries.
   * @param options.initialDelay Initial delay in ms.
   * @param options.backoffFactor Multiplier for delay after each failure.
   */
  static async execute<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number;
      strategy?: 'exponential' | 'fixed';
      strategyOptions?: { initialDelay?: number; backoffFactor?: number; delay?: number };
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 5,
      strategy = 'exponential',
      strategyOptions = { initialDelay: 500, backoffFactor: 2 },
    } = options;
    const syncStrategy: SyncStrategy = SyncStrategyFactory.create(strategy, strategyOptions);
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt > maxRetries) {
          throw err;
        }
        const delay = syncStrategy.getDelay(attempt);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
}
