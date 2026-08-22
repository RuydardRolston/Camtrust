/**
 * CamTrust Password Input with Eye Visibility Toggle
 */

import React, { useState, InputHTMLAttributes } from 'react';

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label = 'Password',
  name = 'password',
  value,
  onChange,
  placeholder = 'Enter your password',
  error,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-800 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={`
            w-full px-3.5 py-2.5 sm:py-3 pr-10 text-sm text-gray-800 placeholder-gray-400 bg-white
            border rounded-xl transition-all duration-150 outline-none
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-[#ea9200] focus:ring-2 focus:ring-amber-500/20'}
            disabled:bg-gray-50 disabled:text-gray-400
            ${className}
          `}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default PasswordInput;
