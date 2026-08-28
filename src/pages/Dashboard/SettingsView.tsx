/**
 * CamTrust - Settings View
 * Professional account settings with profile info, security, and preferences.
 */

import React, { useState } from 'react';
import {
  Settings2,
  User,
  Shield,
  Bell,
  Palette,
  Key,
  Mail,
  Phone,
  MapPin,
  Building2,
  LogOut,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export interface SettingsViewProps {
  user?: {
    fullName?: string;
    email?: string;
    role?: string;
  };
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
  const { user: authUser, logout } = useAuth();
  const currentUser = user || authUser;

  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: '+1 (555) 000-0000',
    location: 'Nairobi, Kenya',
    company: 'CamTrust Ltd',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    darkMode: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const roleLabel =
    currentUser?.role === 'property_owner'
      ? 'Project Owner'
      : currentUser?.role === 'professional'
      ? 'Civil Engineer'
      : currentUser?.role === 'administrator'
      ? 'Administrator'
      : 'Member';

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center">
            <Settings2 size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage your profile, security, and application preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition mb-1 last:mb-0 ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                  <p className="text-xs text-gray-500">Update your personal details and role information.</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company / Organization</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                      <CheckCircle2 size={14} /> Saved successfully
                    </span>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-gray-900/20 transition"
                  >
                    <Save size={16} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Security</h2>
                  <p className="text-xs text-gray-500">Update your password and security preferences.</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
                      <CheckCircle2 size={14} /> Password updated
                    </span>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/20 transition"
                  >
                    <Shield size={16} />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Preferences</h2>
                  <p className="text-xs text-gray-500">Configure how you receive updates and notifications.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive project updates and alerts via email.' },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Get critical alerts sent to your phone.' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive a weekly summary of project progress.' },
                ].map((pref) => (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-900">{pref.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{pref.desc}</div>
                    </div>
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          [pref.key]: !formData[pref.key as keyof typeof formData],
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        formData[pref.key as keyof typeof formData] ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          formData[pref.key as keyof typeof formData] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Palette size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
                  <p className="text-xs text-gray-500">Customize the look and feel of your dashboard.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Dark Mode</div>
                    <div className="text-xs text-gray-500 mt-0.5">Switch between light and dark themes.</div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, darkMode: !formData.darkMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      formData.darkMode ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        formData.darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition">
                  <div>
                    <div className="text-sm font-bold text-gray-900">Compact Mode</div>
                    <div className="text-xs text-gray-500 mt-0.5">Reduce spacing for a denser dashboard view.</div>
                  </div>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        darkMode: !formData.darkMode,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      formData.darkMode ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        formData.darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
