/**
 * CamTrust - Progress Reports View (Screen 10)
 * Matches reference poster: Header with "+ New Report" button, verified site photo strips (+12, +8, +6), and notes.
 */

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ShieldCheck,
  Download,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { ReportItem } from '../../utils/dashboardData';

export interface ProgressReportsViewProps {
  reports: ReportItem[];
  onAddReport: (newReport: Omit<ReportItem, 'id'>) => void;
}

export const ProgressReportsView: React.FC<ProgressReportsViewProps> = ({
  reports,
  onAddReport,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [milestone, setMilestone] = useState('Roofing Structure');

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddReport({
      projectId: '1',
      projectName: 'Modern Villa Construction',
      title,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      author: 'Eng. Mark Tala',
      authorRole: 'Civil Engineer',
      photosCount: 4,
      images: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=300&auto=format&fit=crop'
      ],
      notes: notes || 'Site inspection completed in accordance with structural drawings.',
      milestone
    });

    setTitle('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Bar with "+ New Report" */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Progress Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Browse timestamped field reports and photo evidence submitted by licensed site supervisors.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition"
        >
          <Plus size={18} />
          <span>New Report</span>
        </button>
      </div>

      {/* 2. Reports Feed (Matching Screen 10) */}
      <div className="space-y-5">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            {/* Header of Report */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                    {r.date}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    {r.title}
                  </h2>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span>By <strong className="text-gray-700">{r.author}</strong> ({r.authorRole})</span>
                  <span>•</span>
                  <span>Project: {r.projectName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  <ShieldCheck size={13} /> Verified Evidence
                </span>
                <button
                  onClick={() => alert(`Downloading PDF report: ${r.title}`)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                  title="Download PDF"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Notes */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
              {r.notes}
            </p>

            {/* Photo Thumbnail Strip with (+count) */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-orange-500" />
                  Site Evidence Photos ({r.photosCount} total)
                </span>
                <span className="text-[11px] text-gray-400">GPS & Timestamp embedded</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {r.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group cursor-pointer">
                    <img
                      src={img}
                      alt="Site report photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {idx === r.images.length - 1 && r.photosCount > r.images.length && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-extrabold text-base">
                        +{r.photosCount - r.images.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. New Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-fadeIn relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900">Create Field Progress Report</h2>
            <p className="text-xs text-gray-500 mt-1">
              Document current site progress, observations, and milestone completion.
            </p>

            <form onSubmit={handleCreateReport} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roofing truss placement & water barrier installation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Associated Milestone
                </label>
                <select
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="Land Preparation">Land Preparation</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Columns & Beams">Columns & Beams</option>
                  <option value="Walls & Masonry">Walls & Masonry</option>
                  <option value="Roofing Structure">Roofing Structure</option>
                  <option value="Electrical & Plumbing">Electrical & Plumbing</option>
                  <option value="Finishing">Finishing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Detailed Notes & Observations
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the completed work, materials used, inspection results..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressReportsView;
