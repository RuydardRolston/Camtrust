/**
 * CamTrust Application Routes
 * Configures the Landing, Login and Register pages.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from '../pages/Landing/Landing';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Workspace from '../pages/Workspace';
<<<<<<< HEAD
import ProjectsList from '../pages/Projects/ProjectsList';
import ProjectDetail from '../pages/Projects/ProjectDetail';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import EngineerDashboard from '../pages/Engineer/EngineerDashboard';
import OwnerDashboard from '../pages/Owner/OwnerDashboard';
=======
>>>>>>> 5714c36df0577f4836d13dd605ee11fb95f89c90

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Workspace />} />
      <Route path="/dashboard/:role" element={<Workspace />} />
<<<<<<< HEAD
      <Route path="/projects" element={<ProjectsList />} />
      <Route path="/projects/:code" element={<ProjectDetail />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/engineer" element={<EngineerDashboard />} />
      <Route path="/owner" element={<OwnerDashboard />} />
=======
>>>>>>> 5714c36df0577f4836d13dd605ee11fb95f89c90
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
