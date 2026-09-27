/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#0a0e14',
        card: '#12171f',
        panel: '#161d28',
        input: '#141a24',
        border: '#1e2a3a',
        primary: '#e6edf3',
        secondary: '#b0b8c4',
        muted: '#5c6773',
        accent: '#ff2d78',
        'accent-hover': '#e1034d',
        'severity-high': '#ff4d4d',
        'severity-medium': '#f5a623',
        'severity-low': '#3fb950',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        dropIn: 'dropIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fadeIn: 'fadeIn 0.2s ease',
        toastSlideDown: 'toastSlideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        spin: 'spin 0.7s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        dropIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        toastSlideDown: {
          '0%': { opacity: '0', transform: 'translate(-50%, -20px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      }
    },
  },
  plugins: [],
}
