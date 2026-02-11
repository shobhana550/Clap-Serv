/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - Red accent
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
        // Secondary colors - Gray palette
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
        // Accent colors
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
        // Warning colors
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
        // Error/Danger colors
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
        // Additional utility colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'touch': '44px',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
  plugins: [],
}
