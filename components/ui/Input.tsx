/**
 * Input component for Clap-Serv
 * Controlled input with label and error states
 */

import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { clsx } from 'clsx';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  ...props
}: InputProps) {
  const hasError = !!error;

  return (
    <View className={clsx('mb-4', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-secondary-900 mb-2">
          {label}
        </Text>
      )}

      <View
        className={clsx(
          'flex-row items-center border rounded-lg bg-white px-4 min-h-[44px]',
          hasError ? 'border-error' : 'border-secondary-300',
          'focus:border-primary'
        )}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          className={clsx(
            'flex-1 text-base text-secondary-900 py-3',
            className
          )}
          placeholderTextColor="#C5C4CC"
          {...props}
        />

        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>

      {error && (
        <Text className="text-sm text-error mt-1">{error}</Text>
      )}

      {helperText && !error && (
        <Text className="text-sm text-secondary-500 mt-1">{helperText}</Text>
      )}
    </View>
  );
}
