/**
 * CamTrust Register Page
 * Matches Screen 4 in reference design.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import FormError from '../../components/FormError';
import useAuth from '../../hooks/useAuth';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
  validateRole,
} from '../../utils/validators';
import { RegisterData } from '../../types';

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

export const Register: React.FC = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'fullName') {
      const res = validateName(value);
      if (!res.isValid && res.error) setErrors((prev) => ({ ...prev, fullName: res.error || '' }));
    } else if (name === 'email') {
      const res = validateEmail(value);
      if (!res.isValid && res.error) setErrors((prev) => ({ ...prev, email: res.error || '' }));
    } else if (name === 'password') {
      const res = validatePassword(value);
      if (!res.isValid && res.error) setErrors((prev) => ({ ...prev, password: res.error || '' }));
    } else if (name === 'confirmPassword') {
      const res = validateConfirmPassword(formData.password, value);
      if (!res.isValid && res.error) setErrors((prev) => ({ ...prev, confirmPassword: res.error || '' }));
    } else if (name === 'role') {
      const res = validateRole(value);
      if (!res.isValid && res.error) setErrors((prev) => ({ ...prev, role: res.error || '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const nameRes = validateName(formData.fullName);
    if (!nameRes.isValid && nameRes.error) newErrors.fullName = nameRes.error;

    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid && emailRes.error) newErrors.email = emailRes.error;

    const passRes = validatePassword(formData.password);
    if (!passRes.isValid && passRes.error) newErrors.password = passRes.error;

    const confirmRes = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmRes.isValid && confirmRes.error) newErrors.confirmPassword = confirmRes.error;

    const roleRes = validateRole(formData.role);
    if (!roleRes.isValid && roleRes.error) newErrors.role = roleRes.error;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setSuccessMessage('Account created successfully! You can now log in.');
    } catch (err: unknown) {
      const error = err as Error;
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white p-7 sm:p-9 rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.05)] transition-all">
        {/* Card Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Join CamTrust today
          </p>
        </div>

        <FormError error={serverError} />

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <Input
            id="register-fullname"
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
            disabled={loading}
            required
          />

          <Input
            id="register-email"
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            disabled={loading}
            required
          />

          <div className="space-y-1">
            <PasswordInput
              id="register-password"
              label="Password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              disabled={loading}
              required
            />
            {formData.password && (
              <div className="flex items-center gap-2 pt-1 px-1">
                <div className="flex-1 bg-gray-100 h-1 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${strength.color}`} style={{ width: strength.percent }}></div>
                </div>
                <span className={`text-[10px] font-semibold ${strength.text}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <PasswordInput
            id="register-confirm-password"
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            disabled={loading}
            required
          />

          {/* I am a Role Dropdown */}
          <div>
            <label htmlFor="register-role" className="block text-xs font-semibold text-gray-800 mb-1.5">
              Role
            </label>
            <div className="relative">
              <select
                id="register-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                className={`
                  w-full px-3.5 py-2.5 sm:py-3 text-sm text-gray-800 bg-white
                  border rounded-xl transition-all duration-150 outline-none appearance-none pr-10 cursor-pointer
                  ${errors.role ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-[#ea9200] focus:ring-2 focus:ring-amber-500/20'}
                  ${!formData.role ? 'text-gray-400' : 'text-gray-800 font-medium'}
                `}
              >
                <option value="" disabled>Select your role</option>
                <option value="property_owner" className="text-gray-800">Property Owner</option>
                <option value="professional" className="text-gray-800">Construction Professional</option>
                <option value="administrator" className="text-gray-800">Administrator</option>
              </select>

              {/* Chevron icon */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-500 font-medium">{errors.role}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              loadingText="Creating Account..."
            >
              Create Account
            </Button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-gray-600 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-gray-900 hover:text-[#ea9200] transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
