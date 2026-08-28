/**
 * CamTrust - Professionals Verification View
 * Real backend-backed verification list with approve/reject actions.
 */

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Clock,
  XCircle,
  Award,
  Search,
  Loader2
} from 'lucide-react';
import verificationService from '../../services/verificationService';

export interface Verification {
  id: number;
  professionalId: number;
  professional: {
    id: number;
    fullName: string;
    email: string;
  };
  status: string;
  date: string;
}

export const ProfessionalsVerificationView: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const data = await verificationService.getPendingVerifications();
      setVerifications(data.verifications || []);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await verificationService.approveVerification(id);
      await loadVerifications();
    } catch (err) {
      alert('Failed to approve verification');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await verificationService.rejectVerification(id);
      await loadVerifications();
    } catch (err) {
      alert('Failed to reject verification');
    }
  };

  const filtered = verifications.filter((a) =>
    a.professional?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="text-emerald-600" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Professionals Verification
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review and approve qualified professionals for project supervision.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by engineer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">No pending verifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-gray-900">{a.professional?.fullName || 'Unknown'}</h3>
                  <div className="text-xs text-gray-500">{a.professional?.email}</div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    a.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : a.status === 'Rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {a.status === 'Pending' && <><Clock size={13} /> Pending</>}
                  {a.status === 'Approved' && <><ShieldCheck size={13} /> Verified</>}
                  {a.status === 'Rejected' && <><XCircle size={13} /> Rejected</>}
                </span>
              </div>

              {a.status === 'Pending' && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
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
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessionalsVerificationView;
