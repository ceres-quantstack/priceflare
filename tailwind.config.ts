import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand
        'brand': {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',  // Primary orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Neutrals
        'surface': {
          50: '#FAFAF9',   // Page background
          100: '#F5F5F4',  // Card background
          200: '#E7E5E4',  // Borders
          300: '#D6D3D1',  // Muted borders
          400: '#A8A29E',  // Placeholder text
          500: '#78716C',  // Secondary text
          600: '#57534E',  // Body text
          700: '#44403C',  // Strong text
          800: '#292524',  // Headings
          900: '#1C1917',  // Darkest text
        },
        // Accent teal for links and interactive
        'accent': {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        // Semantic
        'deal': '#16A34A',      // Best deal green
        'deal-bg': '#F0FDF4',   // Deal background
        'save': '#059669',      // Savings text
        // Legacy aliases
        'sky-blue': '#14B8A6',
        'dark-blue': '#292524',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fire-flicker': 'fireFlicker 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fireFlicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        'elevated': '0 20px 40px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
