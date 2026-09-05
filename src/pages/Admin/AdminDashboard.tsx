/**
 * CamTrust - Admin Dashboard
 * Real platform stats and activity feed.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  FolderKanban,
  Camera,
} from 'lucide-react';
import adminService from '../../services/adminService';
import projectService from '../../services/projectService';
import verificationService from '../../services/verificationService';

export interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export interface Stats {
  totalUsers?: number;
  totalProjects: number;
  activeProjects: number;
  verifiedProfessionals: number;
  evidenceSubmittedThisWeek: number;
  pendingVerifications: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [statsRes, projectsRes, verificationsRes] = await Promise.all([
        adminService.getPlatformStats(),
        projectService.getAllProjects(),
        verificationService.getPendingVerifications(),
      ]);
      const projectsList = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.projects || []);
      const verificationsList = Array.isArray(verificationsRes) ? verificationsRes : (verificationsRes?.verifications || []);
      setStats({
        ...statsRes.stats,
        totalProjects: projectsList.length,
        pendingVerifications: verificationsList.length,
      });
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Platform overview of activities, users, and engineer verifications.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('users-mgmt')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Users</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{stats?.totalProjects || 0}</div>
          <div className="text-xs text-blue-600 font-semibold mt-1">Platform Accounts</div>
        </div>

        <div
          onClick={() => onNavigateTab('verification')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Professionals</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{stats?.verifiedProfessionals || 0}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Licensed Engineers</div>
        </div>

        <div
          onClick={() => onNavigateTab('projects-mgmt')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Projects</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{stats?.totalProjects || 0}</div>
          <div className="text-xs text-orange-600 font-semibold mt-1">Monitored Sites</div>
        </div>

        <div
          onClick={() => onNavigateTab('evidence')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Evidence</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Camera size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{stats?.evidenceSubmittedThisWeek || 0}</div>
          <div className="text-xs text-purple-600 font-semibold mt-1">This Week</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
