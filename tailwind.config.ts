import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        bg: {
          primary: '#000000',
          secondary: '#0a0a0a',
          card: '#111111',
          elevated: '#1c1c1e',
          hover: '#2c2c2e',
        },
        apple: {
          blue: '#0071e3',
          'blue-hover': '#0077ed',
          green: '#30d158',
          orange: '#ff9f0a',
          red: '#ff453a',
          yellow: '#ffd60a',
          purple: '#bf5af2',
        },
        text: {
          primary: '#f5f5f7',
          secondary: '#a1a1a6',
          tertiary: '#636366',
          disabled: '#3a3a3c',
        },
        border: {
          default: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.15)',
          focus: 'rgba(0,113,227,0.6)',
          subtle: 'rgba(255,255,255,0.04)',
        },
        risk: {
          safe: '#30d158',
          low: '#ffd60a',
          flagged: '#ff9f0a',
          high: '#ff453a',
        },
      },
      borderRadius: {
        card: '16px',
        button: '980px',
        modal: '20px',
        input: '10px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
