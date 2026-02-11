/**
 * Button component for Clap-Serv
 * Touch-optimized with minimum 44px height
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { clsx } from 'clsx';

export interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary active:bg-primary-700',
    secondary: 'bg-secondary-100 active:bg-secondary-200',
    outline: 'bg-transparent border-2 border-primary active:bg-primary-50',
    ghost: 'bg-transparent active:bg-secondary-100',
    danger: 'bg-error active:bg-error-700',
  };

  // Size styles
  const sizeStyles = {
    sm: 'py-2 px-4',
    md: 'py-3 px-6',
    lg: 'py-4 px-8',
  };

  // Text variant styles
  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-secondary-900',
    outline: 'text-primary',
    ghost: 'text-primary',
    danger: 'text-white',
  };

  // Text size styles
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={clsx(
        'rounded-lg items-center justify-center flex-row min-h-[44px]',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className
      )}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'outline' || variant === 'ghost' ? '#E20010' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <View>{icon}</View>}
          <Text
            className={clsx(
              'font-semibold text-center',
              textVariantStyles[variant],
              textSizeStyles[size]
            )}
          >
            {children}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
