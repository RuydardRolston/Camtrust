/**
 * CamTrust - Milestones & Timeline View (Screen 9)
 * Matches reference poster: Header with "+ Add Milestone" button, interactive milestone checklist, and timeline.
 */

import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { MilestoneItem } from '../../utils/dashboardData';

export interface MilestonesViewProps {
  milestones: MilestoneItem[];
  onAddMilestone: (newMilestone: Omit<MilestoneItem, 'id'>) => void;
  onToggleMilestoneStatus: (id: string) => void;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({
  milestones,
  onAddMilestone,
  onToggleMilestoneStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const completedCount = milestones.filter((m) => m.status === 'Completed').length;
  const inProgressCount = milestones.filter((m) => m.status === 'In Progress').length;
  const pendingCount = milestones.filter((m) => m.status === 'Pending').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddMilestone({
      projectId: '1',
      title,
      date: date || 'Estimated ' + new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      status: 'Pending',
      progress: 0,
    });

    setTitle('');
    setDate('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Bar with "+ Add Milestone" */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Milestones / Timeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track key phases of construction from land preparation to final handover.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition"
        >
          <Plus size={18} />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* 2. Stat Counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-emerald-600">{completedCount}</div>
          <div className="text-xs text-gray-500 font-semibold mt-0.5">Completed Phases</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-orange-500">{inProgressCount}</div>
          <div className="text-xs text-gray-500 font-semibold mt-0.5">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-extrabold text-gray-400">{pendingCount}</div>
          <div className="text-xs text-gray-500 font-semibold mt-0.5">Upcoming Pending</div>
        </div>
      </div>

      {/* 3. Timeline Cards Container (Matching Screen 9) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
          {milestones.map((m) => {
            const isCompleted = m.status === 'Completed';
            const isInProgress = m.status === 'In Progress';

            return (
              <div
                key={m.id}
                className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50/50 transition group"
              >
                {/* Timeline Dot Icon */}
                <div
                  onClick={() => onToggleMilestoneStatus(m.id)}
                  className={`absolute -left-7 sm:-left-9 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ring-4 ring-white flex items-center justify-center cursor-pointer transition ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isInProgress
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                  title="Click to toggle status"
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  ) : isInProgress ? (
                    <Clock size={13} className="stroke-[3]" />
                  ) : (
                    <Circle size={10} />
                  )}
                </div>

                {/* Title & Date */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900">
                      {m.title}
                    </h3>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Calendar size={12} className="text-gray-400" />
                    <span>{m.date || 'Pending'}</span>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isInProgress
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {m.status}
                  </span>

                  <button
                    onClick={() => onToggleMilestoneStatus(m.id)}
                    className="text-xs text-gray-400 hover:text-orange-600 font-semibold px-2 py-1 rounded hover:bg-orange-50 transition"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Add Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-fadeIn relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900">Add Project Milestone</h2>
            <p className="text-xs text-gray-500 mt-1">
              Create a new progress milestone for engineers to track and submit photo proof.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roof Truss Installation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Estimated Target Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 Jul 2025"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestonesView;
