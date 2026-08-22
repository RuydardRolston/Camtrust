/**
 * CamTrust Input Field Component
 */

import React, { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-800 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
        className={`
          w-full px-3.5 py-2.5 sm:py-3 text-sm text-gray-800 placeholder-gray-400 bg-white
          border rounded-xl transition-all duration-150 outline-none
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-[#ea9200] focus:ring-2 focus:ring-amber-500/20'}
          disabled:bg-gray-50 disabled:text-gray-400
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
