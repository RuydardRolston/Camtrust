/**
 * CamTrust - Documents View (Screen 11)
 * Matches reference poster: Header with "+ Upload" button, categorized files with size, date, and download action.
 */

import React, { useState } from 'react';
import {
  FolderLock,
  Plus,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  UploadCloud,
  X
} from 'lucide-react';
import { INITIAL_DOCUMENTS, DocumentItem } from '../../utils/dashboardData';

export const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [category, setCategory] = useState('Drawings');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;

    const newDoc: DocumentItem = {
      id: 'd' + (documents.length + 1),
      name: newDocName.endsWith('.pdf') || newDocName.endsWith('.xlsx') ? newDocName : `${newDocName}.pdf`,
      category,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      type: newDocName.endsWith('.xlsx') ? 'xlsx' : 'pdf',
    };

    setDocuments([newDoc, ...documents]);
    setNewDocName('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Bar with "+ Upload" */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderLock className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Documents
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Secure cloud repository for building permits, architectural drawings, engineering tests, and contracts.
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

      {/* 2. Documents List (Screen 11) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {documents.map((doc) => {
            const isSpreadsheet = doc.type === 'xlsx' || doc.name.endsWith('.xlsx');

            return (
              <div
                key={doc.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSpreadsheet
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {isSpreadsheet ? <FileSpreadsheet size={22} /> : <FileText size={22} />}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-gray-900 hover:text-orange-600 cursor-pointer transition">
                      {doc.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded text-[10px]">
                        {doc.category}
                      </span>
                      <span>•</span>
                      <span>Uploaded {doc.date}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => alert(`Downloading: ${doc.name}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-fadeIn relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900">Upload Project Document</h2>
            <p className="text-xs text-gray-500 mt-1">
              Store blueprints, structural calculations, and legal approvals in the project vault.
            </p>

            <form onSubmit={handleUpload} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Calculations.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="Drawings">Drawings & Blueprints</option>
                  <option value="Permits">Government Permits</option>
                  <option value="Contracts">Contract & Legal</option>
                  <option value="Finance">Financial & Invoices</option>
                  <option value="Engineering">Soil & Structural Tests</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-200 hover:border-orange-400 rounded-2xl p-6 text-center bg-gray-50/50 cursor-pointer transition">
                <UploadCloud className="mx-auto text-orange-500 mb-2" size={32} />
                <div className="text-xs font-semibold text-gray-700">
                  Drag and drop file here, or browse
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  PDF, DOCX, XLSX up to 25MB
                </div>
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
                  Upload File
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
