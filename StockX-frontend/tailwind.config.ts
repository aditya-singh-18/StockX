import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0B',
        foreground: '#F9FAFB',
        card: '#141416',
        'card-foreground': '#F9FAFB',
        border: '#27272A',
        'border-subtle': '#1F1F23',
        muted: '#18181B',
        'muted-foreground': '#9CA3AF',
        brand: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Primary Orange Accent
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
      },
      borderRadius: {
        lg: '8px',
        xl: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
