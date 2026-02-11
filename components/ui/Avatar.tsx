/**
 * Avatar component for Clap-Serv
 * User avatar with fallback initials
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import { clsx } from 'clsx';
import { getInitials } from '@/lib/utils/formatting';

export interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, imageUrl, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const initials = getInitials(name);

  return (
    <View
      className={clsx(
        'rounded-full items-center justify-center bg-primary-100',
        sizeClasses[size],
        className
      )}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className={clsx('rounded-full', sizeClasses[size])}
          resizeMode="cover"
        />
      ) : (
        <Text
          className={clsx(
            'font-semibold text-primary-700',
            textSizeClasses[size]
          )}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}
