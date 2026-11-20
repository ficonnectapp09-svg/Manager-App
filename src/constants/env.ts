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
  serverUrl: (process.env['APP_PUBLIC_URL'] || process.env['API_BASE_URL']?.replace(/\/api\/?$/, '') || 'https://manager-website.onrender.com'),
  apiBaseUrl: (process.env['API_BASE_URL'] || 'https://manager-website.onrender.com/api'),
  socketUrl: (process.env['SOCKET_URL'] || 'wss://manager-website.onrender.com/ws'),
  googleMapsApiKey: 'AIzaSyA_DemoGoogleMapsApiKeyForForgeIndia2026',
  mongoDbAtlasUri: '',
  enableAnalytics: false,
  enablePushNotifications: false,
  apiTimeoutMs: 30000,
  useMockData: false,
};

