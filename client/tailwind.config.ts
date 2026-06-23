import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#4F252E',
          light: '#6b3340',
          dark: '#3a1b22',
        },
        cream: {
          DEFAULT: '#FFF7C5',
          dark: '#f5eca0',
          darker: '#e8dc7a',
        },
      },
      fontFamily: {
        brand: ['Archivo Black', 'sans-serif'],
        editorial: ['Libre Baskerville', 'serif'],
        body: ['Neuton', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config