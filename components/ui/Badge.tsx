/**
 * Badge component for Clap-Serv
 * Status badges with color variants
 */

import React from 'react';
import { View, Text } from 'react-native';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variantStyles = {
    success: 'bg-accent-100 border-accent-500',
    warning: 'bg-warning-100 border-warning-500',
    error: 'bg-error-100 border-error-500',
    info: 'bg-primary-100 border-primary-500',
    default: 'bg-secondary-100 border-secondary-400',
  };

  const textVariantStyles = {
    success: 'text-accent-700',
    warning: 'text-warning-700',
    error: 'text-error-700',
    info: 'text-primary-700',
    default: 'text-secondary-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View
      className={clsx(
        'rounded-full border inline-flex items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <Text
        className={clsx(
          'font-medium',
          textVariantStyles[variant],
          textSizeStyles[size]
        )}
      >
        {children}
      </Text>
    </View>
  );
}
