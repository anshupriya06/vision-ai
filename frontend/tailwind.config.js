/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          black:  '#020617',
          navy:   '#0f172a',
          card:   '#0d1b2a',
          dark:   '#111827',
        },
        neon: {
          cyan:   '#00f0ff',
          green:  '#00ff9f',
          red:    '#ff3b3b',
          blue:   '#3b82f6',
        },
        safe:   '#00ff9f',
        unsafe: '#ff3b3b',
        accent: '#00f0ff',
      },
      fontFamily: {
        orbitron:  ['Orbitron', 'sans-serif'],
        space:     ['Space Grotesk', 'sans-serif'],
        mono:      ['JetBrains Mono', 'monospace'],
        sans:      ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan':  '0 0 8px #00f0ff, 0 0 20px #00f0ff55',
        'neon-green': '0 0 8px #00ff9f, 0 0 20px #00ff9f55',
        'neon-red':   '0 0 8px #ff3b3b, 0 0 20px #ff3b3b55',
        'neon-blue':  '0 0 8px #3b82f6, 0 0 20px #3b82f655',
        'card':       '0 4px 32px rgba(0,0,0,0.7)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'scan':         'scan 3s linear infinite',
        'flicker':      'flicker 4s linear infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'slide-in':     'slideIn 0.3s ease-out',
        'shake':        'shake 0.4s ease-out',
        'spin-slow':    'spin 4s linear infinite',
        'border-glow':  'borderGlow 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: 1 },
          '96%':           { opacity: 0.6 },
          '97%':           { opacity: 1 },
          '98%':           { opacity: 0.7 },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px #00f0ff, 0 0 10px #00f0ff55' },
          '50%':      { boxShadow: '0 0 15px #00f0ff, 0 0 30px #00f0ff88' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)', opacity: 0 },
          to:   { transform: 'translateX(0)',    opacity: 1 },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: '#00f0ff55' },
          '50%':      { borderColor: '#00f0ff' },
        },
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
