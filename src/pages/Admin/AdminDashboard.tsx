/**
 * CamTrust - Admin Dashboard (Screen 17)
 * Matches reference poster: 4 Stat Cards (120 Users, 45 Professionals, 75 Projects, 36 Reports),
 * and Recent Activities log (New user registered, New project created, Professional verified, New report submitted).
 */

import React from 'react';
import {
  Users,
  UserCheck,
  FolderKanban,
  FileText,
  Clock
} from 'lucide-react';

export interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const recentActivities = [
    { title: 'New user registered', subject: 'John Doe', time: '18 Jun, 2025', icon: Users, color: 'text-blue-500 bg-blue-50' },
    { title: 'New project created', subject: 'Modern Villa', time: '18 Jun, 2025', icon: FolderKanban, color: 'text-orange-500 bg-orange-50' },
    { title: 'Professional verified', subject: 'Eng. Mark Tala', time: '18 Jun, 2025', icon: UserCheck, color: 'text-emerald-500 bg-emerald-50' },
    { title: 'New report submitted', subject: 'Duplex Residence', time: '18 Jun, 2025', icon: FileText, color: 'text-purple-500 bg-purple-50' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Platform overview of platform activities, user registrations, and engineer verifications.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Metric Cards (Screen 17) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 120 Users */}
        <div
          onClick={() => onNavigateTab('users-mgmt')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Users</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">120</div>
          <div className="text-xs text-blue-600 font-semibold mt-1">Platform Accounts</div>
        </div>

        {/* 45 Professionals */}
        <div
          onClick={() => onNavigateTab('verification')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Professionals</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">45</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Licensed Engineers</div>
        </div>

        {/* 75 Projects */}
        <div
          onClick={() => onNavigateTab('projects-mgmt')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Projects</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">75</div>
          <div className="text-xs text-orange-600 font-semibold mt-1">Monitored Sites</div>
        </div>

        {/* 36 Reports */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Reports</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <FileText size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">36</div>
          <div className="text-xs text-purple-600 font-semibold mt-1">Field Inspections</div>
        </div>
      </div>

      {/* Recent Activities Section (Screen 17) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
            <p className="text-xs text-gray-500 mt-0.5">Real-time log of administrative events and platform milestones</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
            <Clock size={14} />
            <span>Auto-updating</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentActivities.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{act.title}</div>
                    <div className="text-xs text-gray-500 font-medium">{act.subject}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 font-semibold">{act.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
