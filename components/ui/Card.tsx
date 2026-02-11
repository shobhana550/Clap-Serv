/**
 * Card component for Clap-Serv
 * Container with shadow and padding
 */

import React from 'react';
import { View, TouchableOpacity, ViewProps } from 'react-native';
import { clsx } from 'clsx';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  className,
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-secondary-200',
    outlined: 'bg-transparent border-2 border-secondary-300',
    elevated: 'bg-white shadow-md',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const content = (
    <View
      className={clsx(
        'rounded-lg',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
