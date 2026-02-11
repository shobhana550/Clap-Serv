/**
 * Validation utility functions for Clap-Serv
 */

import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

export const isValidEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

// Password validation (min 8 chars, at least one letter and one number)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const isValidPassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

// Phone validation (basic)
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const isValidPhone = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success;
};

// Budget validation
export const budgetSchema = z.object({
  min: z.number().min(0, 'Minimum budget must be positive'),
  max: z.number().min(0, 'Maximum budget must be positive'),
}).refine(data => data.max >= data.min, {
  message: 'Maximum budget must be greater than or equal to minimum',
  path: ['max'],
});

// Service request validation schema
export const serviceRequestSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  budgetMin: z.number().min(0, 'Minimum budget must be positive'),
  budgetMax: z.number().min(0, 'Maximum budget must be positive'),
  timeline: z.string().optional(),
  deadline: z.string().optional(),
});

// Proposal validation schema
export const proposalSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  price: z.number().min(0, 'Price must be positive'),
  timelineEstimate: z.string().optional(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(1000, 'Cover letter must be less than 1000 characters').optional(),
});

// Profile validation schema
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  phone: phoneSchema.optional(),
  role: z.enum(['buyer', 'provider', 'both']),
});

// Provider profile validation schema
export const providerProfileSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Signup validation schema
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['buyer', 'provider', 'both']),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// File validation
export const validateFileSize = (sizeInBytes: number, maxSizeInMB: number = 10): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

export const validateFileType = (mimeType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimeType);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Sanitize input (basic XSS prevention)
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
