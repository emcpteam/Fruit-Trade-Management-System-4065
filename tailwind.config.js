/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        nordic: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7d0c7',
          300: '#a4b3a4',
          400: '#7d917d',
          500: '#5f7a5f',
          600: '#4a614a',
          700: '#3d4f3d',
          800: '#334233',
          900: '#2b372b',
        },
        cream: {
          50: '#fefcf8',
          100: '#fdf7ed',
          200: '#faecd4',
          300: '#f6ddb2',
          400: '#f0c985',
          500: '#e9b165',
          600: '#dc9750',
          700: '#b87b43',
          800: '#93633e',
          900: '#775135',
        }
      }
    },
  },
  plugins: [],
}