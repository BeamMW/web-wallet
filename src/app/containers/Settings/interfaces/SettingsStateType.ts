import { VersionInterface } from './VersionInterface';
import { connectedSiteInterface } from './ConnectedSiteInterface';

export interface SettingsStateType {
  version: VersionInterface;
  logs: string;
  connectedSites: connectedSiteInterface[];
}
