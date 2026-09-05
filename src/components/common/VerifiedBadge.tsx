import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  subtext?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  showText = true,
  className = '',
  subtext,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 11,
    md: 14,
    lg: 16,
  };

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <span
        className={`inline-flex items-center font-extrabold tracking-wide uppercase rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 shadow-xs shadow-emerald-500/10 ${sizeClasses[size]}`}
        title="Identity and professional credentials verified by Camtrust Administrator"
      >
        <ShieldCheck size={iconSizes[size]} className="text-emerald-600 shrink-0" />
        {showText && (
          <span className="flex items-center gap-1 font-bold">
            <span className="text-emerald-600">✓</span> VERIFIED CONSTRUCTION PROFESSIONAL
          </span>
        )}
      </span>
      {subtext && (
        <span className="text-[10px] text-gray-500 font-medium ml-1 mt-0.5">
          {subtext}
        </span>
      )}
    </div>
  );
};

export default VerifiedBadge;
