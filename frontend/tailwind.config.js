/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ba9b4f',
          light: '#d4b366',
          dark: '#a08640',
        },
        accent: {
          DEFAULT: '#7AAFBF',
          light: '#9FC7D4',
        },
        background: '#FBF9F4',
        surface: {
          DEFAULT: '#FFFFFF',
          warm: '#F5EFE0',
        },
        'text-primary': '#3D3530',
        'text-secondary': '#8A8078',
        success: '#5DB879',
        info: '#7AAFBF',
        'warm-gold': '#F5EFE6',
        'warm-white': '#FFF9F0',
        border: '#E8E0D2',
        'dark-surface': '#1E1A2E',
        'dark-surface-warm': '#2A2438',
        'dark-border': '#3C3558',
      },
      fontFamily: {
        heading: ['"Ikra Slab"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
