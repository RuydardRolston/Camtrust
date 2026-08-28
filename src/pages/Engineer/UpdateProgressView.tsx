/**
 * CamTrust - Engineer Update Progress View
 * Enables engineers to update milestones and submit progress reports.
 */

import React, { useState, useEffect } from 'react';
import {
  HardHat,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Camera,
  Loader2
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import assignmentService from '../../services/assignmentService';
import projectService from '../../services/projectService';
import milestoneService from '../../services/milestoneService';
import reportService from '../../services/reportService';
import evidenceService from '../../services/evidenceService';

export interface Project {
  id: number;
  title: string;
  location: string;
  budget: string;
  status: string;
  startDate: string;
}

export interface Milestone {
  id: number;
  projectId: number;
  label: string;
  plannedDate: string;
  completionRate: number;
  status: string;
}

export const UpdateProgressView: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestones(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const assignments = await assignmentService.getMyAssignments();
      const projectPromises = (assignments.assignments || []).map((a: any) =>
        projectService.getProjectById(a.projectId)
      );
      const projectsData = await Promise.all(projectPromises);
      const projectsList = projectsData.map((p: any) => p.project).filter(Boolean);
      setProjects(projectsList);
      if (projectsList.length > 0) {
        setSelectedProjectId(projectsList[0].id);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async (projectId: number) => {
    try {
      const data = await milestoneService.getMilestones(projectId);
      const ms = data.milestones || [];
      setMilestones(ms);
      if (ms.length > 0) {
        setSelectedMilestoneId(ms[0].id);
        setProgress(ms[0].completionRate || 0);
      }
    } catch (err) {
      console.error('Failed to load milestones:', err);
    }
  };

  const handleMilestoneChange = (milestoneId: number) => {
    setSelectedMilestoneId(milestoneId);
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (milestone) {
      setProgress(milestone.completionRate || 0);
    }
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneId) return;

    try {
      setSubmitting(true);
      await milestoneService.updateMilestone(selectedMilestoneId, {
        completionRate: progress,
        status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending',
      });

      await reportService.submitReport({
        projectId: String(selectedProjectId),
        summary: notes || `Progress update: ${progress}% completion`,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit progress');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="text-emerald-600" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Update Progress & Site Evidence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Update milestone completion and submit progress reports.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
          <ShieldCheck size={15} /> Verified Engineer Portal
        </span>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>Progress update submitted successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmitProgress} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
            Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
            Milestone
          </label>
          <select
            value={selectedMilestoneId}
            onChange={(e) => handleMilestoneChange(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.completionRate}%)
              </option>
            ))}
          </select>
        </div>

        <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Milestone Progress
            </label>
            <span className="text-xl font-extrabold text-emerald-600 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-200">
              {progress}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
            Site Notes & Observations
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document structural inspection, materials, curing status..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Verified Progress Update'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProgressView;
