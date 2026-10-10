/**
 * CamTrust - Notification Context
 * Provides real-time notifications via Socket.IO and API.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { socket, SOCKET_EVENTS } from '../services/socket';
import notificationService from '../services/notificationService';
import { getAuthToken } from '../services/api';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  date: string;
  status: string;
  targetTab?: string;
  projectId?: number;
  partnerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const token = getAuthToken();
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications();
      const items = Array.isArray((data as any)?.notifications)
        ? (data as any).notifications
        : Array.isArray(data)
          ? data
          : [];
      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      refresh();
    }
  }, []);

  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      if (!notification) return;
      const formatted: Notification = {
        id: notification.id || Date.now(),
        userId: notification.userId || 0,
        message: notification.message || 'New notification',
        date: notification.createdAt || new Date().toISOString(),
        status: 'unread',
        targetTab: notification.targetTab,
        projectId: notification.projectId,
        partnerId: notification.partnerId,
      };
      setNotifications((prev) => {
        if (prev.some((n) => n.id === formatted.id)) {
          return prev;
        }
        return [formatted, ...prev];
      });
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    };
  }, []);

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, refresh, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
