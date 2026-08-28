/**
 * CamTrust - Notifications View
 * Real database-backed notifications list.
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import notificationService from '../../services/notificationService';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  date: string;
  status: string;
}

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Notifications
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => n.status === 'unread' && handleMarkRead(n.id)}
                className={`p-5 hover:bg-gray-50/60 transition cursor-pointer ${
                  n.status === 'unread' ? 'bg-orange-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{n.message}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(n.date).toLocaleString()}
                    </div>
                  </div>
                  {n.status === 'unread' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
