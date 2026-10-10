/**
 * CamTrust - Users Management View
 * Matches reference specifications: Platform users table with inspection, verification toggles, and detailed engineer audit modal.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Trash2,
  CheckCircle2,
  Plus,
  X,
  ShieldCheck,
  UserX,
  Eye,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Building,
  Loader2,
  MessageSquare,
  Sparkles,
  Ban,
  UserCheck as UserCheckIcon
} from 'lucide-react';
import userService from '../../services/userService';
import adminService from '../../services/adminService';
import { User } from '../../types';

export interface DisplayUser extends User {
  status?: string;
  phone?: string;
  address?: string;
  specialty?: string;
  employeeId?: string;
  joinedDate?: string;
  verificationStatus?: string;
  verified?: boolean;
}

export const UsersManagementView: React.FC = () => {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creating, setCreating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<DisplayUser | null>(null);
  const [updatingVerification, setUpdatingVerification] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    role: 'property_owner',
    status: 'active',
    password: '',
  });

  // Load live users from backend database
  useEffect(() => {
    fetchBackendUsers();
  }, []);

  const fetchBackendUsers = async () => {
    try {
      setLoadingUsers(true);
      const liveUsers = await userService.getAllUsers();
      const usersList = (liveUsers as any)?.users || (Array.isArray(liveUsers) ? liveUsers : []);
      const formatted: DisplayUser[] = usersList.map((u: any) => ({
        ...u,
        status: (u.status || 'active').toLowerCase(),
        joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : 'Recent',
        verificationStatus: u.verified ? 'Verified' : (u.role === 'professional' ? 'Unverified' : 'N/A'),
      }));
      setUsers(formatted);
    } catch {
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleVerification = async (user: DisplayUser, newVerifiedStatus: boolean) => {
    try {
      setUpdatingVerification(true);
      if (user.id !== undefined) {
        await userService.toggleVerification(user.id, newVerifiedStatus);
      }
      
      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                verified: newVerifiedStatus,
                verificationStatus: newVerifiedStatus ? 'Verified' : 'Unverified',
              }
            : u
        )
      );

      if (selectedEngineer && selectedEngineer.id === user.id) {
        setSelectedEngineer({
          ...selectedEngineer,
          verified: newVerifiedStatus,
          verificationStatus: newVerifiedStatus ? 'Verified' : 'Unverified',
        });
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setUpdatingVerification(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.specialty || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (roleFilter === 'Owner') matchesFilter = u.role === 'property_owner';
    else if (roleFilter === 'Engineer') matchesFilter = u.role === 'professional' || u.role === 'engineer';
    else if (roleFilter === 'Verified Engineers') matchesFilter = (u.role === 'professional' || u.role === 'engineer') && !!u.verified;
    else if (roleFilter === 'Unverified Engineers') matchesFilter = (u.role === 'professional' || u.role === 'engineer') && !u.verified;
    else if (roleFilter === 'Admin') matchesFilter = u.role === 'administrator' || u.role === 'admin';

    return matchesSearch && matchesFilter;
  });

  const handleDeleteUser = async (id: string | number | undefined) => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
      } catch {
        // Optimistic local state update
      }
      setUsers(users.filter((u) => String(u.id) !== String(id)));
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email) return;

    const userEntry: DisplayUser = {
      id: Date.now(),
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      joinedDate: 'Today',
      verified: newUser.role === 'property_owner' || newUser.role === 'administrator',
    };

    setUsers([userEntry, ...users]);
    setNewUser({ fullName: '', email: '', role: 'property_owner', status: 'Active', password: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Users & Engineer Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Inspect civil engineer credentials, verify or unverify professionals, and manage system accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-600/20 transition cursor-pointer"
          >
            <Plus size={18} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Owner', 'Engineer', 'Verified Engineers', 'Unverified Engineers', 'Admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                roleFilter === r
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">User Profile</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6">Role & Specialty</th>
                <th className="py-4 px-6">Verification Status</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                    No matching users found in directory.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isEngineer = u.role === 'professional' || u.role === 'engineer';
                  const roleBadge =
                    u.role === 'administrator' || u.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : isEngineer
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-orange-50 text-orange-700 border-orange-200';

                  const roleName =
                    u.role === 'administrator' || u.role === 'admin'
                      ? 'Administrator'
                      : isEngineer
                      ? 'Civil Engineer'
                      : 'Project Owner';

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedEngineer(u)}
                      className="hover:bg-orange-50/40 transition cursor-pointer group"
                    >
                      <td className="py-4 px-6 font-bold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shadow-xs">
                            {(u.fullName || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition flex items-center gap-1.5">
                              <span>{u.fullName || 'Unnamed User'}</span>
                              {isEngineer && u.verified && (
                                <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-normal">
                              Joined: {u.joinedDate || 'Recent'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-gray-600 text-xs">
                        <div className="font-semibold text-gray-800">{u.email}</div>
                        {u.phone && <div className="text-[11px] text-gray-400 mt-0.5">{u.phone}</div>}
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleBadge}`}>
                            {roleName}
                          </span>
                          {u.specialty && (
                            <div className="text-[11px] text-gray-500 font-medium truncate max-w-xs">
                              {u.specialty}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isEngineer ? (
                          <div className="flex items-center gap-2">
                            {u.verified ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
                                <ShieldCheck size={13} className="text-emerald-600" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full shadow-xs">
                                <UserX size={13} className="text-amber-600" />
                                Unverified
                              </span>
                            )}

                            {/* Quick Toggle Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVerification(u, !u.verified);
                              }}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                                u.verified
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                              title={u.verified ? 'Mark as Unverified' : 'Mark as Verified'}
                            >
                              {u.verified ? 'Unverify' : 'Verify'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">N/A</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={12} /> {u.status || 'Active'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedEngineer(u)}
                          className="p-2 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition"
                          title="Inspect Profile & Credentials"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineer Profile & Verification Inspection Modal */}
      {selectedEngineer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-fadeIn relative space-y-6">
            <button
              onClick={() => setSelectedEngineer(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 font-black text-xl flex items-center justify-center shadow-md">
                {(selectedEngineer.fullName || selectedEngineer.email || 'E').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-gray-900">
                    {selectedEngineer.fullName || 'User Profile'}
                  </h2>
                  {selectedEngineer.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck size={13} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedEngineer.role === 'professional' ? 'Civil Engineer & Construction Supervisor' : selectedEngineer.role}
                </p>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-gray-50/80 p-5 rounded-2xl border border-gray-100 text-xs">
              <div className="space-y-1">
                <div className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </div>
                <div className="font-bold text-gray-900">{selectedEngineer.email}</div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Phone size={12} /> Phone Number
                </div>
                <div className="font-bold text-gray-900">{selectedEngineer.phone || '+237 (Not Provided)'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Briefcase size={12} /> Engineering Specialty
                </div>
                <div className="font-bold text-gray-900">
                  {selectedEngineer.specialty || 'Civil & Structural Engineering'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Calendar size={12} /> Member Since
                </div>
                <div className="font-bold text-gray-900">{selectedEngineer.joinedDate || 'Jan 2025'}</div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="text-gray-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Building size={12} /> Office / Site Address
                </div>
                <div className="font-medium text-gray-800">
                  {selectedEngineer.address || 'Yaoundé / Douala Construction Hub, Cameroon'}
                </div>
              </div>
            </div>

            {/* Verification Status & Admin Control Section */}
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-600" />
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                  Engineer Verification & Compliance Controls
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                As Administrator, you can certify this engineer or revoke their verification status. Verified engineers receive the official badge and can be assigned to active client construction projects to issue certified audit reports.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={updatingVerification || selectedEngineer.verified === true}
                  onClick={() => handleToggleVerification(selectedEngineer, true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  {updatingVerification ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span>Mark as Verified</span>
                </button>

                <button
                  type="button"
                  disabled={updatingVerification || selectedEngineer.verified === false}
                  onClick={() => handleToggleVerification(selectedEngineer, false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition cursor-pointer"
                >
                  {updatingVerification ? <Loader2 size={14} className="animate-spin" /> : <UserX size={16} />}
                  <span>Mark as Unverified</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-400">
                User ID: #{selectedEngineer.id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedEngineer(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-fadeIn relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black text-gray-900">Add Platform User</h2>
            <p className="text-xs text-gray-500 mt-1">
              Create an administrative, owner, or professional account.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eng. Jean Dupont"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  System Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="property_owner">Project Owner</option>
                  <option value="professional">Civil Engineer / Contractor</option>
                  <option value="administrator">Platform Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 cursor-pointer"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementView;
