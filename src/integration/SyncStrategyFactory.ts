export interface SyncStrategy {
  getDelay(attempt: number): number;
}

export class ExponentialBackoffStrategy implements SyncStrategy {
  constructor(private initialDelay: number, private backoffFactor: number) {}
  getDelay(attempt: number): number {
    return this.initialDelay * Math.pow(this.backoffFactor, attempt - 1);
  }
}

export class FixedDelayStrategy implements SyncStrategy {
  constructor(private delay: number) {}
  getDelay(_attempt: number): number {
    return this.delay;
  }
}

export class SyncStrategyFactory {
  static create(
    strategy: 'exponential' | 'fixed',
    options: { initialDelay?: number; backoffFactor?: number; delay?: number }
  ): SyncStrategy {
    if (strategy === 'exponential') {
      return new ExponentialBackoffStrategy(
        options.initialDelay ?? 500,
        options.backoffFactor ?? 2
      );
    } else if (strategy === 'fixed') {
      return new FixedDelayStrategy(options.delay ?? 500);
    }
    throw new Error('Unknown sync strategy');
  }
}
