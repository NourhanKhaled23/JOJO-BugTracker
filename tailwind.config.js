/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          hover: 'var(--bg-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          bright: 'var(--accent-bright)',
          subtle: 'var(--accent-subtle)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans:    ['Outfit', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        accent:  ['JetBrains Mono', 'monospace'],
      },
      screens: {
        xs:   '375px',
        sm:   '640px',
        md:   '768px',
        lg:   '1024px',
        xl:   '1280px',
        '2xl':'1536px'
      },
      keyframes: {
        reveal: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%':      { transform: 'translateX(-8px)' },
          '30%':      { transform: 'translateX(8px)' },
          '45%':      { transform: 'translateX(-6px)' },
          '60%':      { transform: 'translateX(6px)' },
          '75%':      { transform: 'translateX(-3px)' },
          '90%':      { transform: 'translateX(3px)' },
        },
        lift: {
          '0%':   { transform: 'translateY(0)',   boxShadow: 'none' },
          '100%': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.3)' },
        }
      },
      animation: {
        reveal:     'reveal 0.3s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        shake:      'shake 0.45s ease-in-out',
      }
    },
  },
  plugins: [],
}
