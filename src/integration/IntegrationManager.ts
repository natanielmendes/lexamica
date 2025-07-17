import { ConfigManager } from '../config/ConfigManager';
import { PollingHandler } from './PollingHandler';
import { Adapter } from './Adapter';
import { RedisQueue } from './RedisQueue';
import axios from 'axios';

export class IntegrationManager {
  private pollingHandlers: PollingHandler[] = [];

  constructor(configManager: ConfigManager, redisQueue: RedisQueue) {
    const orgConfigs = configManager.getOrgConfigs();
    for (const config of orgConfigs) {
      if (config.pollingInterval && config.pollingEndpoint) {
        const fetchFn = async () => {
          if (!config.pollingEndpoint) {
            throw new Error('pollingEndpoint is undefined');
          }
          const response = await axios.get(config.pollingEndpoint);
          return response.data;
        };
        const adapter: Adapter = {
          normalize: (input: any) => input,
          transformToTarget: (input: any) => input,
        };
        const handler = new PollingHandler({
          intervalMs: config.pollingInterval,
          fetchFn: async () => {
            if (!config.pollingEndpoint) {
              throw new Error('pollingEndpoint is undefined');
            }
            const response = await axios.get(config.pollingEndpoint);
            
            return response.data.map((item: any) => {
              const transformed = config.productTransform ? config.productTransform(item) : item;
              return adapter.transformToTarget(transformed);
            });
          },
          adapter,
          queueName: `${config.orgId}_products`,
          redisQueue,
        });
        handler.start();
        this.pollingHandlers.push(handler);
      }
    }
  }
}
