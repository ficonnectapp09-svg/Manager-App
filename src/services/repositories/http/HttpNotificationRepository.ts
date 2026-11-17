/**
 * HTTP Implementation of INotificationRepository
 */
import { INotificationRepository } from '../INotificationRepository';
import { AppNotification } from '../../../types';
import { apiClient } from '../../api/ApiClient';
import { services } from '../../index';

export class HttpNotificationRepository implements INotificationRepository {
  private async getToken(): Promise<string | null> {
    return services.storageService.getAuthToken();
  }

  async getNotifications(managerId: string): Promise<AppNotification[]> {
    const token = await this.getToken();
    const response = await apiClient.get<AppNotification[]>('/notifications', {
      token,
      params: { managerId },
    });
    const rawList = Array.isArray(response.data)
      ? response.data
      : (Array.isArray((response as any).notifications)
        ? (response as any).notifications
        : []);

    const list: AppNotification[] = rawList.map((raw: any) => {
      const typeStr = String(raw.type || raw.category || '').toLowerCase();
      const titleStr = String(raw.title || '').toLowerCase();
      const recordId = raw.recordId || raw.metadata?.recordId || raw.metadata?.id || '';

      let deepLinkScreen = raw.deepLinkScreen || '';
      let deepLinkParams = raw.deepLinkParams || {};

      if (!deepLinkScreen) {
        if (typeStr.includes('vendor') || titleStr.includes('vendor') || titleStr.includes('merchant')) {
          deepLinkScreen = recordId ? 'VendorDetail' : 'Vendors';
          if (recordId) deepLinkParams = { vendorId: recordId };
        } else if (typeStr.includes('task') || titleStr.includes('task')) {
          deepLinkScreen = recordId ? 'TaskDetail' : 'Tasks';
          if (recordId) deepLinkParams = { taskId: recordId };
        } else if (typeStr.includes('report') || typeStr.includes('visit') || titleStr.includes('report') || titleStr.includes('visit')) {
          deepLinkScreen = recordId ? 'ReportDetail' : 'Reports';
          if (recordId) deepLinkParams = { reportId: recordId };
        } else if (typeStr.includes('issue') || typeStr.includes('ticket') || titleStr.includes('issue') || titleStr.includes('ticket')) {
          deepLinkScreen = recordId ? 'IssueDetail' : 'Issues';
          if (recordId) deepLinkParams = { issueId: recordId };
        } else if (typeStr.includes('order') || typeStr.includes('booking') || titleStr.includes('order') || titleStr.includes('booking')) {
          deepLinkScreen = 'Dashboard';
        }
      }

      return {
        id: String(raw._id || raw.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`),
        title: raw.title || 'Notification',
        body: raw.message || raw.body || '',
        category: raw.category || raw.type || 'system',
        priority: raw.priority || 'MEDIUM',
        targetManagerId: raw.userId || raw.targetManagerId || '',
        isRead: Boolean(raw.isRead),
        deepLinkScreen: deepLinkScreen || undefined,
        deepLinkParams: Object.keys(deepLinkParams).length > 0 ? deepLinkParams : undefined,
        createdAt: raw.createdAt || new Date().toISOString(),
      };
    });

    return list;
  }

  async getUnreadCount(managerId: string): Promise<number> {
    const token = await this.getToken();
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count', {
      token,
      params: { managerId },
    });
    return response.data?.count ?? (response as any).count ?? 0;
  }

  async markAsRead(notificationId: string): Promise<AppNotification> {
    const token = await this.getToken();
    const response = await apiClient.patch<AppNotification>(`/notifications/${notificationId}/read`, {}, { token });
    return response.data;
  }

  async markAllAsRead(managerId: string): Promise<void> {
    const token = await this.getToken();
    await apiClient.post('/notifications/mark-all-read', { managerId }, { token });
  }

  async registerFCMToken(managerId: string, fcmToken: string, role?: string, territory?: any): Promise<boolean> {
    const token = await this.getToken();
    const response = await apiClient.post<{ success: boolean }>('/notifications/register-token', {
      managerId,
      fcmToken,
      role,
      territory,
    }, { token });
    return response.data?.success ?? true;
  }

  async unregisterFCMToken(managerId: string, fcmToken: string): Promise<boolean> {
    const token = await this.getToken();
    const response = await apiClient.post<{ success: boolean }>('/notifications/unregister-token', {
      managerId,
      fcmToken,
    }, { token });
    return response.data?.success ?? true;
  }
}
