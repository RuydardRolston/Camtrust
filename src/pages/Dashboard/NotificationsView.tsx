/**
 * CamTrust - Notifications View (Screen 12)
 * Matches reference poster: Real-time alert list with category filters and interactive mark-as-read.
 */

import React, { useState } from 'react';
import {
  Bell,
  FileText,
  MessageSquare,
  FolderLock,
  Layers,
  Check
} from 'lucide-react';
import { INITIAL_NOTIFICATIONS, NotificationItem } from '../../utils/dashboardData';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.category === filter;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Notifications & Alerts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Stay updated with real-time site events, engineer uploads, and milestone completions.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
        >
          <Check size={14} />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'progress', label: 'Progress Reports' },
          { id: 'milestone', label: 'Milestones' },
          { id: 'message', label: 'Messages' },
          { id: 'document', label: 'Documents' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === tab.id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Cards Feed (Screen 12) */}
      <div className="space-y-3">
        {filtered.map((n) => {
          const isProgress = n.category === 'progress';
          const isMilestone = n.category === 'milestone';
          const isMessage = n.category === 'message';
          const isDocument = n.category === 'document';

          return (
            <div
              key={n.id}
              onClick={() => toggleRead(n.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !n.read
                  ? 'bg-orange-50/40 border-orange-200/80 shadow-sm'
                  : 'bg-white border-gray-100 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isProgress
                      ? 'bg-blue-100 text-blue-700'
                      : isMilestone
                      ? 'bg-emerald-100 text-emerald-700'
                      : isMessage
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {isProgress && <FileText size={20} />}
                  {isMilestone && <Layers size={20} />}
                  {isMessage && <MessageSquare size={20} />}
                  {isDocument && <FolderLock size={20} />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{n.title}</h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.description}</p>
                  <div className="text-[10px] text-gray-400 font-medium pt-0.5">
                    {n.date}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRead(n.id);
                }}
                className="text-[11px] text-gray-400 hover:text-orange-600 font-medium px-2 py-1 rounded hover:bg-gray-100 flex-shrink-0"
              >
                {n.read ? 'Mark unread' : 'Mark read'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsView;
