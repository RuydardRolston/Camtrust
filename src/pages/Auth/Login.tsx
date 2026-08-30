/**
 * CamTrust Login Page
 * Matches Screen 3 in reference design.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import Button from '../../components/Button';
import FormError from '../../components/FormError';
import useAuth from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validators';
import { LoginCredentials } from '../../types';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      const { isValid, error } = validateEmail(value);
      if (!isValid && error) setErrors((prev) => ({ ...prev, email: error }));
    } else if (name === 'password') {
      const { isValid, error } = validatePassword(value);
      if (!isValid && error) setErrors((prev) => ({ ...prev, password: error }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailRes = validateEmail(formData.email);
    if (!emailRes.isValid && emailRes.error) newErrors.email = emailRes.error;

    const passRes = validatePassword(formData.password);
    if (!passRes.isValid && passRes.error) newErrors.password = passRes.error;

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
      const user = await login(formData);
      setSuccessMessage('Logged in successfully!');
      window.setTimeout(() => navigate(`/dashboard/${user.role}`), 250);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setServerError(error.message || 'Invalid email or password.');
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
            Welcome Back!
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Login to your CamTrust account
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
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            id="login-email"
            label="Email address"
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

          <PasswordInput
            id="login-password"
            label="Password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            disabled={loading}
            required
          />

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 rounded border-gray-300 text-[#ea9200] focus:ring-[#ea9200]/30"
              />
              <span className="text-xs font-semibold text-gray-700">
                Remember me
              </span>
            </label>

            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset instructions will be sent to your email.');
              }}
              className="text-xs text-gray-500 hover:text-[#ea9200] font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              loadingText="Logging in..."
            >
              Login
            </Button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-gray-900 hover:text-[#ea9200] transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
