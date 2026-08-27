/**
 * CamTrust Dashboard Top Header
 * Professional, clean navigation bar with global search, live notifications center,
 * and authenticated user profile menu with direct logout.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { INITIAL_NOTIFICATIONS, NotificationItem } from '../../utils/dashboardData';

export interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onSelectTab,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const roleLabel =
    user?.role === 'property_owner'
      ? 'Project Owner'
      : user?.role === 'professional'
      ? 'Civil Engineer'
      : user?.role === 'administrator'
      ? 'Administrator'
      : 'Authenticated Member';

  const roleBadgeColor =
    user?.role === 'property_owner'
      ? 'bg-orange-50 text-orange-700 border-orange-200'
      : user?.role === 'professional'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile menu toggle & Global Search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 lg:hidden transition"
            title="Open Menu"
          >
            <Menu size={22} />
          </button>

          {/* Search bar */}
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search projects, milestones, documents..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50/90 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-xs"
            />
          </div>
        </div>

        {/* Right: Notifications & User Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-orange-600 hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto py-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onSelectTab('notifications');
                        setNotifOpen(false);
                      }}
                      className={`py-3 px-2 rounded-xl flex items-start gap-3 cursor-pointer transition ${
                        !n.read ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-900 truncate">
                          {n.title}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                          {n.description}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 font-medium">
                          {n.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      onSelectTab('notifications');
                      setNotifOpen(false);
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    View all alerts &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative pl-2 border-l border-gray-200" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50 transition text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-orange-500/20">
                {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-gray-900 leading-tight">
                  {user?.fullName || 'User'}
                </div>
                <div className="text-[10px] text-gray-500 font-medium capitalize">
                  {roleLabel}
                </div>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fadeIn">
                <div className="p-3 border-b border-gray-100">
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {user?.fullName || 'Authenticated User'}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate mt-0.5">
                    {user?.email || 'user@camtrust.org'}
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadgeColor}`}>
                    {roleLabel}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition"
                  >
                    <User size={14} className="text-gray-400" />
                    <span>Profile & Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition mt-1"
                  >
                    <LogOut size={14} className="text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
