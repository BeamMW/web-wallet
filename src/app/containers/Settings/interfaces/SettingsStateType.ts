import { VersionInterface } from './VersionInterface';
import { connectedSiteInterface } from './ConnectedSiteInterface';

export interface SettingsStateType {
  version: VersionInterface;
  logs: any;
  connectedSites: connectedSiteInterface[];
}
