/**
 * CamTrust Project Service
 * Axios API requests for projects, milestones, and evidence uploads.
 */

import api from './api';

export interface ProjectData {
  id?: string | number;
  title: string;
  description?: string;
  location?: string;
  budget?: number;
  status?: string;
  ownerId?: string | number;
  engineerId?: string | number;
  [key: string]: unknown;
}

export const createProject = async <T = ProjectData>(data: Partial<ProjectData>): Promise<T> => {
  const response = await api.post<T>('/projects', data);
  return response.data;
};

export const getMyProjects = async <T = ProjectData[]>(): Promise<T> => {
  const response = await api.get<T>('/projects/mine');
  return response.data;
};

export const getProjectById = async <T = ProjectData>(id: string | number): Promise<T> => {
  const response = await api.get<T>(`/projects/${id}`);
  return response.data;
};

export const uploadSiteEvidence = async <T = unknown>(
  milestoneId: string | number,
  formData: FormData
): Promise<T> => {
  const response = await api.post<T>(`/milestones/${milestoneId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const projectService = {
  createProject,
  getMyProjects,
  getProjectById,
  uploadSiteEvidence,
};

export default projectService;
