/**
 * CamTrust - Projects List View (Screen 7)
 * Real database-backed projects list with create, search, and filter.
 * Project Owners can upload feasibility documents (Land Title, Site Plan, Permits) at creation.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  MapPin,
  ArrowRight,
  X,
  Loader2,
  FileText,
  Paperclip,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import projectService from '../../services/projectService';
import { useCurrency } from '../../context/CurrencyContext';
import useAuth from '../../hooks/useAuth';

export interface ProjectsListViewProps {
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export interface Project {
  id: number;
  title: string;
  location: string;
  description: string;
  budget: string;
  status: string;
  startDate: string;
  completionRate?: number;
}

const DOC_CATEGORIES = [
  'Land Title / Deed',
  'Site Survey Plan',
  'Architectural Drawings',
  'Building Permit',
  'Environmental Permit',
  'Feasibility Study',
  'Other',
];

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({
  onSelectProject,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const isOwner = user?.role === 'property_owner';
  const { convert } = useCurrency();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    budget: '',
    startDate: '',
    estimatedDuration: '',
  });

  const [feasibilityFiles, setFeasibilityFiles] = useState<File[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getMyProjects();
      const projectList = Array.isArray(data) ? data : (data?.projects || []);
      setProjects(projectList);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFeasibilityFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      const newFiles = files.filter((f) => !existing.has(f.name + f.size));
      return [...prev, ...newFiles];
    });
    // Reset input so same file can be re-added after removal
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFeasibilityFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return;

    try {
      setCreating(true);
      await projectService.createProject({
        ...formData,
        feasibilityDocs: feasibilityFiles,
      });
      setIsModalOpen(false);
      setFormData({ title: '', location: '', description: '', budget: '', startDate: '', estimatedDuration: '' });
      setFeasibilityFiles([]);
      await loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'All' ? true : p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Approved':
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your construction sites and track progress
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition cursor-pointer"
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm p-4 rounded-xl">
          {error}
          <button onClick={loadProjects} className="ml-2 underline font-semibold">Retry</button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Under Review', 'Approved', 'Rejected', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">No projects found.</p>
          {isOwner && (
            <p className="text-gray-400 text-xs mt-1">Create your first project to get started.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(String(p.id))}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group"
            >
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-orange-600 transition">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <MapPin size={13} className="text-gray-400" />
                    <span>{p.location}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Budget</div>
                    <div className="text-xs font-bold text-gray-900">
                      {convert(Number(p.budget))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateTab('projects'); }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-fadeIn relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-xs text-gray-500 mt-1">
              Submit your construction project for admin review. Attach feasibility documents to speed up approval.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Villa Construction"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yaoundé, Cameroon"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of the construction project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Budget (FCFA)</label>
                  <input
                    type="text"
                    placeholder="e.g. 25000000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 18 months"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* ── Feasibility Documents Upload ── */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Paperclip size={16} className="text-amber-600" />
                  <span className="text-xs font-black text-gray-900">
                    Feasibility &amp; Land Ownership Documents
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Attach land title/deed, site survey plan, architectural drawings, building permits, or any ownership proof to help the administrator assess project feasibility faster.
                </p>

                {/* File list */}
                {feasibilityFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {feasibilityFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={14} className="text-orange-500 shrink-0" />
                          <span className="text-xs font-semibold text-gray-800 truncate">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition shrink-0 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-100/60 text-xs font-bold transition cursor-pointer w-full justify-center"
                >
                  <Plus size={15} />
                  {feasibilityFiles.length === 0 ? 'Attach Documents (PDF, JPG, PNG)' : 'Add More Documents'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFeasibilityFiles([]); }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Submitting...' : 'Submit Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsListView;
