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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Workspace />} />
      <Route path="/dashboard/:role" element={<Workspace />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
