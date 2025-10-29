/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#04c0f4',
          light: '#cfecf4',
          dark: '#0398c4',
          50: '#e6f9fd',
          100: '#cfecf4',
          200: '#9fd9ea',
          300: '#6fc6df',
          400: '#3fb3d5',
          500: '#04c0f4',
          600: '#0398c4',
          700: '#027293',
          800: '#024c62',
          900: '#012631',
        },
        primary: {
          50: '#e6f9fd',
          100: '#cfecf4',
          200: '#9fd9ea',
          300: '#6fc6df',
          400: '#3fb3d5',
          500: '#04c0f4',
          600: '#0398c4',
          700: '#027293',
          800: '#024c62',
          900: '#012631',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #04c0f4 0%, #7b2cbf 100%)',
        'gradient-brand-light': 'linear-gradient(135deg, #cfecf4 0%, #e0b3ff 100%)',
      },
    },
  },
  plugins: [],
}
