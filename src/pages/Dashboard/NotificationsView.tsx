/**
 * CamTrust - Notifications View
 * Real database-backed notifications with real-time updates and one-click direct navigation.
 */

import React from 'react';
import {
  Bell,
  Loader2,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  FileText,
  FolderKanban,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useNotifications, Notification } from '../../context/NotificationContext';
import useAuth from '../../hooks/useAuth';

export interface NotificationsViewProps {
  onNavigateTab?: (tabId: string, projectId?: string | null) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { notifications, loading, markRead } = useNotifications();

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const handleNotificationClick = async (n: Notification) => {
    if (n.status === 'unread') {
      await markRead(n.id);
    }

    if (!onNavigateTab) return;

    const msg = (n.message || '').toLowerCase();
    if (n.targetTab) {
      onNavigateTab(n.targetTab, n.projectId ? String(n.projectId) : undefined);
    } else if (msg.includes('message')) {
      onNavigateTab('messages');
    } else if (msg.includes('document')) {
      onNavigateTab('documents', n.projectId ? String(n.projectId) : undefined);
    } else if (msg.includes('report')) {
      onNavigateTab('reports', n.projectId ? String(n.projectId) : undefined);
    } else if (msg.includes('proposal') || msg.includes('engineer has been proposed')) {
      onNavigateTab('proposals');
    } else if (msg.includes('verification') || msg.includes('kyc')) {
      onNavigateTab(user?.role === 'administrator' ? 'verification' : 'settings');
    } else if (msg.includes('project')) {
      onNavigateTab(user?.role === 'administrator' ? 'projects-mgmt' : 'projects', n.projectId ? String(n.projectId) : undefined);
    }
  };

  const getNotificationIcon = (msg: string) => {
    const text = msg.toLowerCase();
    if (text.includes('message')) return <MessageSquare size={18} className="text-blue-500 shrink-0" />;
    if (text.includes('document')) return <FileText size={18} className="text-orange-500 shrink-0" />;
    if (text.includes('report')) return <FileText size={18} className="text-emerald-500 shrink-0" />;
    if (text.includes('proposal')) return <UserCheck size={18} className="text-purple-500 shrink-0" />;
    if (text.includes('verification') || text.includes('kyc')) return <ShieldCheck size={18} className="text-emerald-600 shrink-0" />;
    return <FolderKanban size={18} className="text-amber-500 shrink-0" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Bell size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Real-Time Notifications
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-black rounded-full border border-orange-200 self-start sm:self-center">
            {unreadCount} Unread
          </span>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
        {notifications.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-gray-700 text-sm font-bold">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">
              You will receive real-time alerts when messages, reports, documents, or project updates are submitted.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`py-4 px-3 flex items-start justify-between gap-4 hover:bg-gray-50/80 rounded-2xl transition cursor-pointer group ${
                  n.status === 'unread' ? 'bg-orange-50/40' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                    {getNotificationIcon(n.message)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm ${n.status === 'unread' ? 'font-black text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.message}
                    </p>
                    <div className="text-[11px] text-gray-400 mt-1 font-medium">
                      {new Date(n.date).toLocaleString('en-GB')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {n.status === 'unread' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 animate-pulse" />
                  )}
                  <ArrowRight size={15} className="text-gray-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition" />
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
