/**
 * Formatting utility functions for Clap-Serv
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Budget range formatting
export const formatBudgetRange = (min: number, max: number): string => {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

// Date formatting
export const formatDate = (date: string | Date, formatString: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

// Time ago formatting (e.g., "2 hours ago")
export const formatTimeAgo = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Distance formatting
export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
};

// Number abbreviation (e.g., 1500 -> 1.5K)
export const abbreviateNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Generate initials from name
export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert snake_case to Title Case
export const snakeToTitle = (str: string): string => {
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

// Format rating (e.g., 4.5/5.0)
export const formatRating = (rating: number): string => {
  return `${rating.toFixed(1)}/5.0`;
};

// Pluralize word based on count
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

// Format count with pluralization (e.g., "5 proposals", "1 proposal")
export const formatCount = (count: number, singular: string, plural?: string): string => {
  return `${count} ${pluralize(count, singular, plural)}`;
};

// Format location
export const formatLocation = (location: { city?: string; state?: string; country?: string }): string => {
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country && !location.state) parts.push(location.country);
  return parts.join(', ') || 'Location not specified';
};

// Clean and format URL
export const formatUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// Get status badge color
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    open: '#10B981', // green
    pending: '#F59E0B', // amber
    accepted: '#10B981', // green
    rejected: '#EF4444', // red
    active: '#3B82F6', // blue
    completed: '#B3B8C4', // gray
    cancelled: '#EF4444', // red
    in_progress: '#3B82F6', // blue
    withdrawn: '#B3B8C4', // gray
  };
  return statusColors[status] || '#B3B8C4';
};

// Get status label
export const getStatusLabel = (status: string): string => {
  return snakeToTitle(status);
};
