/**
 * Environment Configuration Settings
 */

export interface AppEnvironment {
  envName: 'development' | 'staging' | 'production';
  serverUrl: string;
  apiBaseUrl: string;
  socketUrl: string;
  googleMapsApiKey: string;
  mongoDbAtlasUri: string;
  enableAnalytics: boolean;
  enablePushNotifications: boolean;
  apiTimeoutMs: number;
  useMockData: boolean;
}

// Authoritative production configuration aligned with Manager Website
export const ENV: AppEnvironment = {
  envName: 'production',
  serverUrl: 'https://connect-manager.onrender.com',
  apiBaseUrl: 'https://connect-manager.onrender.com/api',
  socketUrl: 'wss://connect-manager.onrender.com/ws',
  googleMapsApiKey: 'AIzaSyA_DemoGoogleMapsApiKeyForForgeIndia2026',
  mongoDbAtlasUri: '',
  enableAnalytics: false,
  enablePushNotifications: false,
  apiTimeoutMs: 30000,
  useMockData: false,
};

