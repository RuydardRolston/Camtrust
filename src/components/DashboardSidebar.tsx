import React from 'react';
import { HardHat, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import './DashboardSidebar.css';

export interface SidebarProps {
  role?: 'property_owner' | 'professional' | 'administrator' | string;
  title?: string;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ role = 'property_owner', title = 'CamTrust' }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="dt-sidebar">
      <div className="dt-brand"><span className="dt-mark"><HardHat size={18} /></span><div className="dt-title">{title}</div></div>
      <div className="dt-role">{role === 'property_owner' ? 'Project Owner' : role === 'professional' ? 'Engineer' : 'Administrator'}</div>

      <nav className="dt-nav">
        <button className="dt-nav-item">Overview</button>
        <button className="dt-nav-item">Projects</button>
        <button className="dt-nav-item">Reports</button>
        <button className="dt-nav-item">Team</button>
      </nav>

      <div className="dt-footer">
        <div className="dt-user">{user?.fullName || user?.email || 'John Doe'}</div>
        <button className="dt-logout" onClick={logout}><LogOut size={14} /> Logout</button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
