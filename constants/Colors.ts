/**
 * Clap-Serv Color Palette
 * Clean, modern design with red accent
 */

export const Colors = {
  // Primary: Red - interactive elements and user attention
  primary: {
    DEFAULT: '#E20010',
    50: '#FFF0F1',
    100: '#FFE0E2',
    200: '#FFC7CB',
    300: '#FFA3A9',
    400: '#FF6B75',
    500: '#E20010', // Main primary
    600: '#C4000E',
    700: '#A5000C',
    800: '#87000A',
    900: '#6B0008',
  },

  // Secondary: Gray palette - clean backgrounds and text
  secondary: {
    DEFAULT: '#E6E9EF',
    50: '#F7F8FA',
    100: '#E6E9EF',
    200: '#C5C4CC',
    300: '#B3B8C4',
    400: '#8E94A0',
    500: '#5F6267',
    600: '#4A4D52',
    700: '#3A3D42',
    800: '#2A2D32',
    900: '#1A1D22',
  },

  // Accent: Green - success states
  accent: {
    DEFAULT: '#10B981',
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Warning: Amber - pending states
  warning: {
    DEFAULT: '#F59E0B',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error: Red - error states (same as primary for consistency)
  error: {
    DEFAULT: '#EF4444',
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Additional semantic colors
  success: '#10B981',
  info: '#3B82F6',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',

  // Text colors (from design guidelines)
  text: {
    primary: '#5F6267',    // Dark gray - headlines and body
    secondary: '#B3B8C4',  // Medium gray - secondary labels
    tertiary: '#C5C4CC',   // Light gray - captions
    inverse: '#FFFFFF',
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F7F8FA',
    tertiary: '#E6E9EF',
  },

  // Border colors
  border: {
    light: '#E6E9EF',      // Very light gray
    DEFAULT: '#C5C4CC',    // Light gray
    dark: '#B3B8C4',       // Medium gray
  },

  // Dividers
  divider: {
    primary: 'rgba(172, 172, 172, 0.31)',  // #50ACACAC equivalent
    subtle: '#E6E9EF',
  },
};

// Theme-aware colors for light/dark mode support
export default {
  light: {
    text: Colors.text.primary,
    background: Colors.background.primary,
    tint: Colors.primary.DEFAULT,
    tabIconDefault: Colors.secondary[200],
    tabIconSelected: Colors.primary.DEFAULT,
    card: Colors.white,
    border: Colors.border.light,
  },
  dark: {
    text: Colors.text.inverse,
    background: Colors.secondary[900],
    tint: Colors.primary[400],
    tabIconDefault: Colors.secondary[600],
    tabIconSelected: Colors.primary[400],
    card: Colors.secondary[800],
    border: Colors.secondary[700],
  },
};
