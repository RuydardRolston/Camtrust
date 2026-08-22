/**
 * CamTrust Primary Action Button Component
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  loading = false,
  loadingText,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        w-full py-3 sm:py-3.5 px-4 bg-[#ea9200] hover:bg-[#d98200] active:bg-[#c27400]
        text-white font-semibold rounded-xl text-sm transition-all duration-150
        shadow-sm hover:shadow active:scale-[0.99] cursor-pointer
        disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {loading ? (loadingText || 'Please wait...') : children}
    </button>
  );
};

export default Button;
