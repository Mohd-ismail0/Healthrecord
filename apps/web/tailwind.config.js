/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        success: '#28A745',
        warning: '#FFA500',
        error: '#DC3545',
        info: '#17A2B8',
      },
    },
  },
  plugins: [],
}
