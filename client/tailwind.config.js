/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: '#111111',
        muted: '#5c5c5c',
        page: '#eef2ee',
        surface: 'rgba(248, 248, 246, 0.97)',
        'surface-solid': '#fafbf9',
        border: 'rgba(0, 0, 0, 0.08)',
        'border-strong': 'rgba(0, 0, 0, 0.12)',
        btn: '#141414',
      },
      maxWidth: {
        shell: '1120px',
      },
      borderRadius: {
        card: '20px',
        btn: '9px',
      },
    },
  },
  plugins: [],
}
