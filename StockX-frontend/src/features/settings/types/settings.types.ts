export interface SystemHealthStatus {
  apiStatus: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  database: string;
  authProvider: string;
  uptime: string;
}
