/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm minimalism palette with coral and sage accents
        coral: {
          50: '#fef7f5',
          100: '#fdeee8',
          200: '#faddd6',
          300: '#f6c2b8',
          400: '#f09d8e',
          500: '#e67e5f', // Primary coral
          600: '#d35a3a',
          700: '#b1472c',
          800: '#913d27',
          900: '#773526',
        },
        sage: {
          50: '#f6f8f6',
          100: '#e9f0e9',
          200: '#d4e2d4',
          300: '#b5ccb5',
          400: '#8fb08f', // Primary sage
          500: '#6d946d',
          600: '#557855',
          700: '#456145',
          800: '#3a4f3a',
          900: '#324232',
        },
        neutral: {
          // Soft, warm neutrals
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        // Relationship health indicators
        healthy: '#6d946d',
        attention: '#e67e5f',
        inactive: '#a8a29e',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gentle': 'pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
} 