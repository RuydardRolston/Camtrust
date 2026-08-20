/**
 * CamTrust Clean Authentication Layout
 * Minimal, light gray background centering the card on all screen sizes.
 */

import React, { ReactNode } from 'react';

export interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center py-10 px-4 font-sans text-gray-900 selection:bg-[#ea9200] selection:text-white">
      <div className="w-full max-w-[420px]">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
