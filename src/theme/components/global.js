// Define estilos compartidos del tema de la aplicación.
import { tokens } from '../tokens'

export const globalOverrides = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      ':root': {},
      body: { backgroundColor: theme.palette.background.default, backgroundImage: 'none', backgroundAttachment: 'fixed' },
      '::view-transition-old(root)': { animation: 'none', zIndex: 1 },
      '::view-transition-new(root)': {
        animation: 'theme-reveal 480ms cubic-bezier(0.16, 1, 0.3, 1) both',
        zIndex: 2,
      },
      '@keyframes theme-reveal': {
        from: {
          clipPath: 'circle(0 at var(--theme-reveal-x, 0px) var(--theme-reveal-y, 100vh))',
          filter: 'blur(4px)',
        },
        to: {
          clipPath: 'circle(var(--theme-reveal-radius, 150vmax) at var(--theme-reveal-x, 0px) var(--theme-reveal-y, 100vh))',
          filter: 'blur(0)',
        },
      },
      '@media (prefers-reduced-motion: reduce)': {
        '::view-transition-new(root)': { animationDuration: '1ms' },
        '.app-module-flow > *': { animation: 'none !important', transition: 'none !important' },
      },
      '*': ['dark', 'light'].includes(theme.scgca?.themeId) ? {
        scrollbarWidth: 'thin',
        scrollbarColor: theme.scgca.themeId === 'dark'
          ? 'rgba(255, 255, 255, 0.24) transparent'
          : 'rgba(107, 114, 128, 0.38) transparent',
        '&::-webkit-scrollbar': { width: 8, height: 8 },
        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.scgca.themeId === 'dark'
            ? 'rgba(255, 255, 255, 0.24)'
            : 'rgba(107, 114, 128, 0.38)',
          borderRadius: 999,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
          '&:hover': { backgroundColor: theme.scgca.themeId === 'dark'
            ? 'rgba(255, 255, 255, 0.38)'
            : 'rgba(75, 85, 99, 0.56)' },
        },
        '&::-webkit-scrollbar-corner': { backgroundColor: 'transparent' },
      } : {},
    }),
  },
}
