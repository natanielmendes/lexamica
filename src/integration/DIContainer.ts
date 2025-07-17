import { RedisQueue } from './RedisQueue';
import { ConfigManager } from '../config/ConfigManager';
import { IntegrationManager } from './IntegrationManager';

export class DIContainer {
  private _redisQueue: RedisQueue;
  private _configManager: ConfigManager;
  private _integrationManager: IntegrationManager;

  constructor() {
    this._redisQueue = new RedisQueue(process.env.REDIS_URL as string);
    this._configManager = new ConfigManager();
    this._integrationManager = new IntegrationManager(this._configManager, this._redisQueue);
  }

  get redisQueue() {
    return this._redisQueue;
  }

  get configManager() {
    return this._configManager;
  }

  get integrationManager() {
    return this._integrationManager;
  }
}
