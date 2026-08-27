/**
 * CamTrust Dashboard Sidebar
 * Static, non-scrolling desktop sidebar strictly tied to the logged-in user's role.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  FileText,
  FolderLock,
  Users,
  DollarSign,
  MessageSquare,
  Bell,
  Bot,
  Settings,
  ShieldCheck,
  UserCheck,
  UploadCloud,
  LogOut,
  HardHat,
  X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'property_owner';

  const isOwner = role === 'property_owner';
  const isEngineer = role === 'professional' || role === 'engineer';
  const isAdmin = role === 'administrator' || role === 'admin';

  const roleLabel = isOwner
    ? 'Project Owner'
    : isEngineer
    ? 'Civil Engineer'
    : 'Administrator';

  const roleBadgeColor = isOwner
    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
    : isEngineer
    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30';

  const activeBgColor = isOwner
    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 font-bold'
    : isEngineer
    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
    : 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold';

  // Navigation items strictly by role
  const ownerNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'milestones', label: 'Milestones', icon: CheckCircle2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FolderLock },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const engineerNav = [
    { id: 'dashboard', label: 'Engineer Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Assigned Projects', icon: FolderKanban },
    { id: 'update-progress', label: 'Update Progress', icon: UploadCloud },
    { id: 'reports', label: 'Site Reports', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FolderLock },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'users-mgmt', label: 'Users Management', icon: Users },
    { id: 'verification', label: 'Professionals Verification', icon: UserCheck },
    { id: 'projects-mgmt', label: 'Projects Management', icon: ShieldCheck },
    { id: 'reports', label: 'All Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isOwner ? ownerNav : isEngineer ? engineerNav : adminNav;

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Static Non-scrolling Desktop Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#162029] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800/80 select-none
          lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:z-30 lg:flex-shrink-0
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Top Header & Navigation */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Logo Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800/60 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 flex-shrink-0">
                <HardHat size={20} className="stroke-[2.4]" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white tracking-tight leading-none">
                  Cam<span className="text-orange-400">Trust</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">
                  Project Monitoring
                </div>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Role Badge */}
          <div className="px-4 pt-3.5 pb-2 flex-shrink-0">
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between ${roleBadgeColor}`}>
              <span>{roleLabel}</span>
              <span className="w-2 h-2 rounded-full bg-current"></span>
            </div>
          </div>

          {/* Navigation Items (Clean, compact spacing so everything fits on screen) */}
          <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left
                    ${
                      isActive
                        ? activeBgColor
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }
                  `}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span className="truncate">{item.label}</span>
                  {item.id === 'notifications' && (
                    <span className="ml-auto bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      3
                    </span>
                  )}
                  {item.id === 'ai-assistant' && (
                    <span className="ml-auto bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Direct Logout Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#121a22] flex-shrink-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {user?.fullName || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.email || 'user@camtrust.org'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
