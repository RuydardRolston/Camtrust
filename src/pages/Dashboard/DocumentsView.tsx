/**
 * CamTrust - Documents View
 * Real database-backed documents list with upload.
 */

import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Plus,
  FileText,
  Download,
  Trash2,
  Loader2
} from 'lucide-react';
import projectService from '../../services/projectService';
import documentService from '../../services/documentService';

export interface Document {
  id: number;
  projectId: number;
  fileName: string;
  fileUrl: string;
  category: string;
  uploadedAt: string;
}

export interface Project {
  id: number;
  title: string;
  location: string;
}

export const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('Drawings');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      if (projectList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectList[0].id);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0 || !selectedProjectId) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('document', files[0]);
      formData.append('projectId', String(selectedProjectId));
      formData.append('category', category);

      await documentService.uploadDocument(formData);
      setIsModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadDocuments(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    try {
      await documentService.deleteDocument(id);
      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderLock className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Documents
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Secure repository for project files and documents
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition"
        >
          <Plus size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-gray-50/60 transition">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <FileText size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{doc.fileName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {doc.category} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition"
                    title="Download"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="Drawings">Drawings & Blueprints</option>
                  <option value="Permits">Government Permits</option>
                  <option value="Contracts">Contract & Legal</option>
                  <option value="Finance">Financial & Invoices</option>
                  <option value="Engineering">Soil & Structural Tests</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.xlsx,.jpg,.png"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload'}
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
