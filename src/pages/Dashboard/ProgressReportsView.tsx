/**
 * CamTrust - Progress Reports View
 * Real database-backed reports list.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Loader2
} from 'lucide-react';
import reportService from '../../services/reportService';
import projectService from '../../services/projectService';

export interface Report {
  id: number;
  projectId: number;
  summary: string;
  generatedAt: string;
}

export interface Project {
  id: number;
  title: string;
  location: string;
}

export const ProgressReportsView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadReports(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, reportsData] = await Promise.all([
        projectService.getMyProjects(),
        reportService.getMyReports(),
      ]);
      setProjects(projectsData.projects || []);
      setReports(reportsData.reports || []);
      if (projectsData.projects?.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData.projects[0].id);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (projectId: number) => {
    try {
      const data = await reportService.getProjectReports(projectId);
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !selectedProjectId) return;

    try {
      await reportService.submitReport({
        projectId: String(selectedProjectId),
        summary,
      });
      setIsModalOpen(false);
      setSummary('');
      await loadReports(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    }
  };

  const filteredReports = selectedProjectId
    ? reports.filter((r) => r.projectId === selectedProjectId)
    : reports;

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
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Progress Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            View and submit progress reports
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">No reports yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReports.map((r) => (
              <div key={r.id} className="p-5 hover:bg-gray-50/60 transition">
                <div className="text-sm font-bold text-gray-900 line-clamp-2">{r.summary}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(r.generatedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">New Report</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold">
                  Submit
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
