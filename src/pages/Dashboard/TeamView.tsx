/**
 * CamTrust - Team / Professionals View (Screen 14)
 * Matches reference poster: Header with "+ Invite Professional" button, licensed professional cards with verified tags and contact actions.
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  X
} from 'lucide-react';
import { INITIAL_TEAM, TeamMember } from '../../utils/dashboardData';

export const TeamView: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Civil Engineer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newMember: TeamMember = {
      id: 't' + (team.length + 1),
      name,
      role,
      specialty: 'Site Operations & Inspection',
      status: 'Active',
      email,
      phone: phone || '+237 600 000 000',
      licenseNumber: license || `ENG/${new Date().getFullYear()}/00${team.length + 1}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    };

    setTeam([...team, newMember]);
    setName('');
    setEmail('');
    setPhone('');
    setLicense('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Team / Professionals
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            People working on your projects with verified certifications and site supervisory rights.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition"
        >
          <Plus size={18} />
          <span>Invite Professional</span>
        </button>
      </div>

      {/* Team Cards Grid (Screen 14) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {team.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-gray-900">{m.name}</h3>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} /> {m.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-orange-600">
                  {m.role}
                </div>
                <div className="text-xs text-gray-500">
                  {m.specialty}
                </div>

                {m.licenseNumber && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 pt-1">
                    <Award size={13} className="text-amber-500" />
                    <span>Lic: <strong className="text-gray-700">{m.licenseNumber}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone size={12} className="text-gray-400" />
                  {m.phone}
                </span>
              </div>

              <a
                href={`mailto:${m.email}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-semibold rounded-lg border border-gray-200 hover:border-orange-200 transition"
              >
                <Mail size={12} />
                <span>Message</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-fadeIn relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900">Invite Construction Professional</h2>
            <p className="text-xs text-gray-500 mt-1">
              Add a certified engineer or site supervisor to submit progress logs for your site.
            </p>

            <form onSubmit={handleInvite} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eng. Sarah Jones"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                  >
                    <option value="Civil Engineer">Civil Engineer</option>
                    <option value="Site Supervisor">Site Supervisor</option>
                    <option value="Architect">Architect</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Geotechnical Specialist">Geotechnical Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    License / Reg No.
                  </label>
                  <input
                    type="text"
                    placeholder="CIV/2021/089"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="engineer@camtrust.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+237 670 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
