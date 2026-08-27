/**
 * CamTrust Application Routes
 * Configures the Landing, Login, Register, and Unified Workspace Dashboards.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Landing } from '../pages/Landing/Landing';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Workspace from '../pages/Workspace';
import useAuth from '../hooks/useAuth';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root Path: Show Landing if unauthenticated, or Workspace if logged in */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/workspace" replace /> : <Landing />} />

      {/* Public Landing & Auth Pages */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Role-Based Dashboard Routes strictly guarded by authentication */}
      <Route path="/workspace" element={<Workspace />} />
      <Route path="/dashboard/:role" element={<Workspace />} />
      <Route path="/owner" element={<Navigate to="/workspace" replace />} />
      <Route path="/engineer" element={<Navigate to="/workspace" replace />} />
      <Route path="/admin" element={<Navigate to="/workspace" replace />} />

      {/* Projects Routes mapped directly to workspace */}
      <Route path="/projects" element={<Navigate to="/workspace?tab=projects" replace />} />
      <Route path="/projects/:code" element={<Navigate to="/workspace?tab=projects" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;