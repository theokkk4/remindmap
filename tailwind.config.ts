import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'ui-rounded', 'sans-serif'],
        secondary: ['var(--font-secondary)', 'ui-sans-serif', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        'frutiger-sky': '#bae6fd',
        'frutiger-blue': '#7dd3fc',
        'frutiger-aqua': '#67e8f9',
        'frutiger-white': '#ffffff',
        'frutiger-glass': 'rgba(255, 255, 255, 0.6)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '0.8',
            filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))',
          },
          '50%': { 
            opacity: '1',
            filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at 20% 30%, #0a0f1e, #050812)',
        'gradient-neon': 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
      },
    },
  },
  plugins: [],
};

export default config;
