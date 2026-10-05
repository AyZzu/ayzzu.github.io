/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        muted: '#6B6B78',
        label: '#8E8E9A',
        line: '#ECE6EE',
        page: '#FDF8FB',
        magenta: '#C800C8',
        pink: '#F0309A',
        pink100: '#FDE8F4',
        pink50: '#FFF5FA',
        lilac: '#D9B8F0',
        brandOrange: '#E8501A',
        wa: '#25D366',
        success: '#22C55E',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      }
    },
  },
  plugins: [],
}
