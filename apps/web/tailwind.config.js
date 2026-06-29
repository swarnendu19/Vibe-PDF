/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['class', '[data-theme="sleek_dark"]'],
  theme: {
    extend: {
      // Map to our CSS custom properties — do not hardcode colours here
      colors: {
        background: 'hsl(var(--bg-primary))',
        'background-secondary': 'hsl(var(--bg-secondary))',
        foreground: 'hsl(var(--text-primary))',
        muted: 'hsl(var(--text-muted))',
        accent: 'hsl(var(--accent-primary))',
        'accent-hover': 'hsl(var(--accent-hover))',
        'accent-subtle': 'hsl(var(--accent-subtle))',
        border: 'hsl(var(--border-thin))',
        'border-strong': 'hsl(var(--border-strong))',
        surface: 'hsl(var(--surface-elevated))',
        'alert-success': 'hsl(var(--alert-success))',
        'alert-warning': 'hsl(var(--alert-warning))',
        'alert-danger': 'hsl(var(--alert-danger))',
        'alert-info': 'hsl(var(--alert-info))',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.75rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      boxShadow: {
        soft: '0 2px 8px 0 hsl(var(--shadow-color) / 0.08)',
        medium: '0 4px 24px 0 hsl(var(--shadow-color) / 0.12)',
        strong: '0 8px 40px 0 hsl(var(--shadow-color) / 0.18)',
        'page': '0 0 0 1px hsl(var(--border-thin)), 0 4px 32px 0 hsl(var(--shadow-color) / 0.15)',
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        prose: '68ch',
        document: '1400px',
      },
    },
  },
  plugins: [],
}
