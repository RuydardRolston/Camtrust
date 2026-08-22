/**
 * CamTrust Form Validation Utilities
 */

import type { ValidationResult, PasswordStrength, UserRole } from '../types/auth';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Please enter your email address.' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true, error: null };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password must contain at least 8 characters.' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must contain at least 8 characters.' };
  }
  return { isValid: true, error: null };
};

export const getPasswordStrength = (password: string = ''): PasswordStrength => {
  if (!password) {
    return { score: 0, label: '', color: 'bg-gray-200', text: 'text-gray-400', percent: '0%' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2 || password.length < 8) {
    return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-500', percent: '33%' };
  }
  if (score <= 4) {
    return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500', percent: '66%' };
  }
  return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500', percent: '100%' };
};

export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'Please enter your full name.' };
  }
  return { isValid: true, error: null };
};

export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true, error: null };
};

export const validateRole = (role: string): ValidationResult => {
  const validRoles: UserRole[] = ['property_owner', 'professional', 'administrator'];
  if (!role || !validRoles.includes(role as UserRole)) {
    return { isValid: false, error: 'Please select a role.' };
  }
  return { isValid: true, error: null };
};

export const validateTerms = (accepted: boolean): ValidationResult => {
  if (!accepted) {
    return { isValid: false, error: 'You must accept the Terms and Conditions.' };
  }
  return { isValid: true, error: null };
};
