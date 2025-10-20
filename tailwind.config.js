/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { // Blue for info & theme
          light: '#60a5fa', DEFAULT: '#3b82f6', dark: '#2563eb',
          '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a', '950': '#172554',
        },
        success: { // Green for primary actions
          light: '#34d399', DEFAULT: '#10b981', dark: '#059669',
        },
        danger: { // Red
          light: '#f87171', DEFAULT: '#ef4444', dark: '#dc2626',
        },
        warning: { // Orange
          light: '#fb923c', DEFAULT: '#f97316', dark: '#ea580c',
        },
        gray: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        numeric: ['Rubik', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      backgroundImage: {
        'gradient-success': 'linear-gradient(to right, #34d399, #10b981)',
      },
      transitionProperty: {
        'transform-shadow': 'transform, box-shadow',
      }
    }
  },
  plugins: [],
}
