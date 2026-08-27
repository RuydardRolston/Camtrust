/**
 * CamTrust - Professionals Verification View (Screen 19)
 * Matches reference poster: List of professional licensure applicants with license numbers,
 * document count, and live "Approve / Reject / Toggle Verified" actions.
 */

import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Clock,
  XCircle,
  Award,
  Search
} from 'lucide-react';
import { INITIAL_VERIFICATIONS, VerificationApplicant } from '../../utils/dashboardData';

export const ProfessionalsVerificationView: React.FC = () => {
  const [applicants, setApplicants] = useState<VerificationApplicant[]>(INITIAL_VERIFICATIONS);
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Verified' } : a))
    );
  };

  const handleReject = (id: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Rejected' } : a))
    );
  };

  const filtered = applicants.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="text-emerald-600" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Professionals Verification
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Audit national engineering licenses and approve qualified professionals for project supervision.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by engineer name or license..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Verification Cards (Screen 19) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a) => {
          const isVerified = a.status === 'Verified';
          const isPending = a.status === 'Pending';

          return (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900">{a.name}</h3>
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold">{a.title}</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                    <Award size={13} className="text-amber-500" />
                    <span>License: <strong className="text-gray-800">{a.licenseNumber}</strong></span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isPending
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isVerified ? (
                    <>
                      <ShieldCheck size={13} /> Verified
                    </>
                  ) : isPending ? (
                    <>
                      <Clock size={13} /> Pending Review
                    </>
                  ) : (
                    <>
                      <XCircle size={13} /> Rejected
                    </>
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {a.documentsCount} documents verified
                </span>

                <div className="flex items-center gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleReject(a.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(a.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        Approve License
                      </button>
                    </>
                  )}

                  {isVerified && (
                    <button
                      onClick={() => handleReject(a.id)}
                      className="text-xs text-gray-400 hover:text-rose-600 font-medium transition"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfessionalsVerificationView;
