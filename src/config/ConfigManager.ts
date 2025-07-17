import { orgConfigs, OrgConfig } from './orgConfig';

export class ConfigManager {
  getOrgConfigs(): OrgConfig[] {
    return orgConfigs;
  }
}
