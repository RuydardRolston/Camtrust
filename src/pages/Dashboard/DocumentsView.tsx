/**
 * CamTrust - Documents View
 * Secure project document repository and recipient-routed transmission system.
 * Allows sending documents specifically to Project Owners, Administrators, or Both,
 * with comprehensive tracking of all sent documents.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FolderLock,
  Plus,
  FileText,
  Download,
  Trash2,
  Loader2,
  Building,
  User,
  ShieldCheck,
  UserCheck,
  Users,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowUpRight,
  Filter,
  Check,
  AlertCircle,
  FileCheck,
  HardHat,
  Inbox,
} from 'lucide-react';
import projectService from '../../services/projectService';
import documentService from '../../services/documentService';
import useAuth from '../../hooks/useAuth';

export interface Document {
  id: number;
  projectId: number;
  fileName: string;
  fileUrl: string;
  category: string;
  targetRecipient?: 'property_owner' | 'engineer' | 'administrator' | 'both' | 'all';
  recipientUserId?: number;
  recipientName?: string;
  notes?: string;
  status?: string;
  uploadedAt: string;
  uploadedBy?: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    verified?: boolean;
  };
  project?: {
    id: number;
    title: string;
    location: string;
  };
}

export interface Project {
  id: number;
  title: string;
  location: string;
  ownerId?: number;
  owner?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export const DocumentsView: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [mySentDocuments, setMySentDocuments] = useState<Document[]>([]);
  const [myReceivedDocuments, setMyReceivedDocuments] = useState<Document[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'all' | 'sent_by_me' | 'received' | 'for_owner' | 'for_engineer' | 'for_admin'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('Drawings');
  const [targetRecipient, setTargetRecipient] = useState<'property_owner' | 'engineer' | 'administrator' | 'both' | 'all'>('property_owner');
  const [memoNotes, setMemoNotes] = useState('');
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadDocuments(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectsData = await projectService.getMyProjects();
      const projectList = Array.isArray(projectsData) ? projectsData : (projectsData?.projects || []);
      setProjects(projectList);
      if (projectList.length > 0) {
        setSelectedProjectId(projectList[0].id);
      }
      await Promise.all([loadSentDocs(), loadReceivedDocs()]);
    } catch (err) {
      console.error('Failed to load projects for documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (projectId: number) => {
    try {
      const data = await documentService.getProjectDocuments(projectId);
      const docsList = Array.isArray(data) ? data : (data?.documents || []);
      setDocuments(docsList);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const loadSentDocs = async () => {
    try {
      const data = await documentService.getMySentDocuments();
      const sentList = Array.isArray(data) ? data : (data?.documents || []);
      setMySentDocuments(sentList);
    } catch (err) {
      console.error('Failed to load sent documents:', err);
    }
  };

  const loadReceivedDocs = async () => {
    try {
      const data = await documentService.getMyReceivedDocuments();
      const recList = Array.isArray(data) ? data : (data?.documents || []);
      setMyReceivedDocuments(recList);
    } catch (err) {
      console.error('Failed to load received documents:', err);
    }
  };

  const openUploadModal = () => {
    if (user?.role === 'property_owner') {
      setTargetRecipient('engineer');
    } else {
      setTargetRecipient('property_owner');
    }
    setIsModalOpen(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0 || !selectedProjectId) {
      alert('Please select a file and project.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('document', files[0]);
      formData.append('projectId', String(selectedProjectId));
      formData.append('category', category);
      formData.append('targetRecipient', targetRecipient);
      if (memoNotes.trim()) {
        formData.append('notes', memoNotes.trim());
      }

      const res = await documentService.uploadDocument(formData);
      setIsModalOpen(false);
      setMemoNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      const recipientLabel =
        targetRecipient === 'property_owner'
          ? 'Project Owner'
          : targetRecipient === 'engineer'
          ? 'Assigned Civil Engineer'
          : targetRecipient === 'administrator'
          ? 'Platform Administrator'
          : targetRecipient === 'both'
          ? 'Both Key Stakeholders'
          : 'All Project Stakeholders';

      setUploadSuccessAlert(`Document "${files[0].name}" successfully delivered to ${recipientLabel}!`);
      setTimeout(() => setUploadSuccessAlert(null), 6000);

      await Promise.all([loadDocuments(selectedProjectId), loadSentDocs(), loadReceivedDocs()]);
    } catch (err: any) {
      alert(err.message || 'Failed to send document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setMySentDocuments((prev) => prev.filter((d) => d.id !== id));
      setMyReceivedDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  // Determine current document source according to active tab
  const sourceDocs =
    activeTab === 'sent_by_me'
      ? mySentDocuments
      : activeTab === 'received'
      ? myReceivedDocuments
      : documents;

  const filteredDocs = sourceDocs.filter((d) => {
    // 1. Tab Level Filtering
    if (activeTab === 'for_owner') {
      const match = d.targetRecipient === 'property_owner' || d.targetRecipient === 'both';
      if (!match) return false;
    } else if (activeTab === 'for_engineer') {
      const match = d.targetRecipient === 'engineer' || d.targetRecipient === 'both';
      if (!match) return false;
    } else if (activeTab === 'for_admin') {
      const match = d.targetRecipient === 'administrator' || d.targetRecipient === 'both';
      if (!match) return false;
    }

    // 2. Category Level Filtering
    if (categoryFilter !== 'all' && d.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  const getRecipientBadge = (doc: Document) => {
    if (doc.targetRecipient === 'property_owner') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <UserCheck size={12} className="text-amber-600" />
          <span>To: Project Owner {doc.recipientName ? `(${doc.recipientName.split(' ')[0]})` : ''}</span>
        </span>
      );
    }
    if (doc.targetRecipient === 'engineer') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <HardHat size={12} className="text-emerald-600" />
          <span>To: Civil Engineer {doc.recipientName ? `(${doc.recipientName.split(' ')[0]})` : ''}</span>
        </span>
      );
    }
    if (doc.targetRecipient === 'administrator') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <ShieldCheck size={12} className="text-purple-600" />
          <span>To: Administrator</span>
        </span>
      );
    }
    if (doc.targetRecipient === 'both') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
          <Users size={12} className="text-teal-600" />
          <span>To: Dual Parties</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Users size={12} className="text-slate-500" />
        <span>To: All Stakeholders</span>
      </span>
    );
  };

  const getRolePill = (role?: string) => {
    switch (role) {
      case 'administrator':
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'professional':
      case 'engineer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center border border-orange-500/20">
              <FolderLock size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Project Documents & Dispatches
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Send official engineering files, drawings, and reports directly to Project Owners or Administrators with delivery tracking.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openUploadModal}
          disabled={projects.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Send size={16} />
          <span>Send / Upload Document</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {uploadSuccessAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{uploadSuccessAlert}</span>
        </div>
      )}

      {/* Primary Recipient Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Building size={14} />
          <span>All Project Files</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'received'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Inbox size={14} />
          <span>Received (Inbox)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700 text-white">
            {myReceivedDocuments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent_by_me')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'sent_by_me'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Send size={14} />
          <span>Documents I Sent</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-orange-600 text-white">
            {mySentDocuments.length}
          </span>
        </button>

        {user?.role !== 'property_owner' && (
          <button
            onClick={() => setActiveTab('for_owner')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'for_owner'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <UserCheck size={14} />
            <span>To Project Owner</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-700 text-white">
              {documents.filter((d) => d.targetRecipient === 'property_owner' || d.targetRecipient === 'both').length}
            </span>
          </button>
        )}

        {user?.role !== 'professional' && (
          <button
            onClick={() => setActiveTab('for_engineer')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'for_engineer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <HardHat size={14} />
            <span>To Civil Engineer</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700 text-white">
              {documents.filter((d) => d.targetRecipient === 'engineer' || d.targetRecipient === 'both').length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('for_admin')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'for_admin'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <ShieldCheck size={14} />
          <span>To Administrator</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-700 text-white">
            {documents.filter((d) => d.targetRecipient === 'administrator' || d.targetRecipient === 'both').length}
          </span>
        </button>
      </div>

      {/* Project Selector & Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {activeTab !== 'sent_by_me' && projects.length > 0 ? (
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-xs max-w-sm w-full">
            <Building size={16} className="text-orange-500 shrink-0" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="bg-transparent text-xs sm:text-sm font-bold text-gray-900 focus:outline-none w-full cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.location})
                </option>
              ))}
            </select>
          </div>
        ) : activeTab === 'sent_by_me' ? (
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200">
            <Clock size={14} className="text-orange-500" />
            <span>Showing all documents dispatched across your construction assignments</span>
          </div>
        ) : null}

        {/* Category filters */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 overflow-x-auto shadow-xs">
          {['all', 'Drawings', 'Reports', 'Engineering', 'Permits', 'Contracts', 'Finance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? 'All Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Records List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              {activeTab === 'sent_by_me'
                ? `Documents You Sent (${filteredDocs.length})`
                : activeTab === 'received'
                ? `Documents Received For You (${filteredDocs.length})`
                : activeTab === 'for_owner'
                ? `Documents Dispatched to Project Owner (${filteredDocs.length})`
                : activeTab === 'for_engineer'
                ? `Documents Dispatched to Civil Engineer (${filteredDocs.length})`
                : activeTab === 'for_admin'
                ? `Documents Dispatched to Platform Administrator (${filteredDocs.length})`
                : `Repository Documents (${filteredDocs.length})`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified cryptographic uploads stamped with timestamp and recipient routing.
            </p>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <FileText className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-gray-700 text-sm font-bold">No documents match the current view filter</p>
            <p className="text-gray-500 text-xs max-w-sm mx-auto">
              {activeTab === 'sent_by_me'
                ? 'You have not dispatched any documents yet. Click "Send / Upload Document" above to send a file.'
                : activeTab === 'received'
                ? 'No documents have been dispatched to you yet.'
                : 'Select another category or click "Send / Upload Document" to transmit a file.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="py-4 px-3 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 rounded-2xl transition group"
              >
                {/* File Metadata */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100 shadow-xs">
                    <FileText size={24} />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* File Title and Recipient Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-gray-900 break-all">
                        {doc.fileName}
                      </span>
                      {getRecipientBadge(doc)}
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-bold text-[10px] uppercase tracking-wider">
                        {doc.category}
                      </span>
                    </div>

                    {/* Sender and Routing Details */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      {doc.project?.title && (
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Building size={12} className="text-orange-500" />
                          <span>{doc.project.title}</span>
                        </span>
                      )}

                      <span>•</span>

                      <span>
                        Sent on {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>

                      {doc.uploadedBy?.fullName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User size={11} className="text-gray-400" />
                            <span className="font-semibold text-gray-700">{doc.uploadedBy.fullName}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getRolePill(doc.uploadedBy.role)}`}>
                              {doc.uploadedBy.role === 'professional' ? 'Engineer' : doc.uploadedBy.role === 'property_owner' ? 'Owner' : 'Admin'}
                            </span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Sender Memo / Notes */}
                    {doc.notes && (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                        <MessageSquare size={13} className="text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Memo:</strong> <span>{doc.notes}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Download / View Document"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </a>

                  {(user?.role === 'administrator' || doc.uploadedBy?.id === user?.id) && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipient-Aware Send/Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100 max-h-[92vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <Send size={16} />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  Send Project Document
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose the recipient to route this document with verified delivery tracking.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* TARGET RECIPIENT SELECTOR CARDS */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Target Recipient *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {user?.role === 'property_owner' ? (
                    <>
                      {/* Recipient Card 1: Assigned Civil Engineer */}
                      <div
                        onClick={() => setTargetRecipient('engineer')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'engineer'
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <HardHat size={18} className={targetRecipient === 'engineer' ? 'text-emerald-600' : 'text-gray-400'} />
                            {targetRecipient === 'engineer' && <Check size={14} className="text-emerald-600" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">Civil Engineer</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Assigned engineer</div>
                        </div>
                      </div>

                      {/* Recipient Card 2: Platform Administrator */}
                      <div
                        onClick={() => setTargetRecipient('administrator')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'administrator'
                            ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <ShieldCheck size={18} className={targetRecipient === 'administrator' ? 'text-purple-600' : 'text-gray-400'} />
                            {targetRecipient === 'administrator' && <Check size={14} className="text-purple-600" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">Administrator</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Platform audit</div>
                        </div>
                      </div>

                      {/* Recipient Card 3: Both */}
                      <div
                        onClick={() => setTargetRecipient('both')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'both'
                            ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <Users size={18} className={targetRecipient === 'both' ? 'text-teal-600' : 'text-gray-400'} />
                            {targetRecipient === 'both' && <Check size={14} className="text-teal-600" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">Both Parties</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Engineer & Admin</div>
                        </div>
                      </div>
                    </>
                  ) : user?.role === 'professional' ? (
                    <>
                      {/* Recipient Card 1: Project Owner */}
                      <div
                        onClick={() => setTargetRecipient('property_owner')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'property_owner'
                            ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <UserCheck size={18} className={targetRecipient === 'property_owner' ? 'text-amber-600' : 'text-gray-400'} />
                            {targetRecipient === 'property_owner' && <Check size={14} className="text-amber-600" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">Project Owner</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Direct to client</div>
                        </div>
                      </div>

                      {/* Recipient Card 2: Platform Administrator */}
                      <div
                        onClick={() => setTargetRecipient('administrator')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'administrator'
                            ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <ShieldCheck size={18} className={targetRecipient === 'administrator' ? 'text-purple-600' : 'text-gray-400'} />
                            {targetRecipient === 'administrator' && <Check size={14} className="text-purple-600" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">Administrator</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Platform compliance</div>
                        </div>
                      </div>

                      {/* Recipient Card 3: Both */}
                      <div
                        onClick={() => setTargetRecipient('both')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'both'
                            ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <Users size={18} className={targetRecipient === 'both' ? 'text-teal-600' : 'text-gray-400'} />
                            {targetRecipient === 'both' && <Check size={14} className="text-teal-600" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">Both Parties</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Owner & Admin</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Recipient Card 1: Project Owner */}
                      <div
                        onClick={() => setTargetRecipient('property_owner')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'property_owner'
                            ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <UserCheck size={18} className={targetRecipient === 'property_owner' ? 'text-amber-600' : 'text-gray-400'} />
                            {targetRecipient === 'property_owner' && <Check size={14} className="text-amber-600" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">Project Owner</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Direct to client</div>
                        </div>
                      </div>

                      {/* Recipient Card 2: Assigned Engineer */}
                      <div
                        onClick={() => setTargetRecipient('engineer')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'engineer'
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <HardHat size={18} className={targetRecipient === 'engineer' ? 'text-emerald-600' : 'text-gray-400'} />
                            {targetRecipient === 'engineer' && <Check size={14} className="text-emerald-600" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">Civil Engineer</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Assigned engineer</div>
                        </div>
                      </div>

                      {/* Recipient Card 3: All Stakeholders */}
                      <div
                        onClick={() => setTargetRecipient('all')}
                        className={`p-3 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                          targetRecipient === 'all'
                            ? 'border-slate-800 bg-slate-100 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <Users size={18} className={targetRecipient === 'all' ? 'text-slate-900' : 'text-gray-400'} />
                            {targetRecipient === 'all' && <Check size={14} className="text-slate-900" />}
                          </div>
                          <div className="text-xs font-black text-gray-900">All Parties</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Project team</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Dynamic Recipient Informational Banner */}
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                  <AlertCircle size={15} className="text-orange-500 shrink-0" />
                  <span>
                    {targetRecipient === 'property_owner' &&
                      `Delivering directly to Project Owner of "${currentProject?.title || 'selected project'}". They will receive an instant notification.`}
                    {targetRecipient === 'engineer' &&
                      `Routing directly to the Assigned Civil Engineer of "${currentProject?.title || 'selected project'}".`}
                    {targetRecipient === 'administrator' &&
                      `Routing to Camtrust Platform Administrator for official engineering compliance and project audit records.`}
                    {targetRecipient === 'both' &&
                      `Broadcasting to both counterparties with verified dual alert routing.`}
                    {targetRecipient === 'all' &&
                      `Delivering to all project stakeholders across the platform.`}
                  </span>
                </div>
              </div>

              {/* Target Project */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Target Construction Project *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Document Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="Drawings">Drawings & Architectural Blueprints</option>
                  <option value="Reports">Official Audit & Progress Reports</option>
                  <option value="Engineering">Soil & Structural Test Certifications</option>
                  <option value="Permits">Government Building Permits & Approvals</option>
                  <option value="Contracts">Contract & Legal Specifications</option>
                  <option value="Finance">Financial Estimates, Invoices & Receipts</option>
                </select>
              </div>

              {/* Memo / Notes for Recipient */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Instructions / Memo for Recipient (Optional)
                </label>
                <textarea
                  rows={2}
                  value={memoNotes}
                  onChange={(e) => setMemoNotes(e.target.value)}
                  placeholder="e.g., Attached revised structural reinforcement schedule. Slump test certifications included."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* File Attachment Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Document File (.pdf, .docx, .xlsx, .jpg, .png) *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx,.jpg,.png,.jpeg"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 cursor-pointer"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs font-black shadow-md shadow-orange-500/25 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Delivering Document...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Deliver Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;
