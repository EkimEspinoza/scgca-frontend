import { alpha, createTheme } from '@mui/material/styles'

import { tokens } from './tokens'
import { componentOverrides } from './components'


/*
 * Configuración común para todos los temas.
 *
 * Los futuros temas reutilizarán esta estructura
 * y cambiarán principalmente palette + elementos visuales.
 */
const baseTheme = {
  spacing: tokens.spacing,

  shape: {
    borderRadius: tokens.radius.medium,
  },

  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),

    /*
     * Escala tipográfica general.
     */
    h1: {
      fontSize: '2rem',
      lineHeight: 1.2,
      fontWeight: 700,
    },

    h2: {
      fontSize: '1.75rem',
      lineHeight: 1.25,
      fontWeight: 700,
    },

    h3: {
      fontSize: '1.5rem',
      lineHeight: 1.3,
      fontWeight: 700,
    },

    h4: {
      fontSize: '1.25rem',
      lineHeight: 1.35,
      fontWeight: 600,
    },

    h5: {
      fontSize: '1.125rem',
      lineHeight: 1.4,
      fontWeight: 600,
    },

    h6: {
      fontSize: '1rem',
      lineHeight: 1.4,
      fontWeight: 600,
    },

    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },

    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },

    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },

    button: {
      fontSize: '0.875rem',
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  /*
   * Breakpoints estándar de MUI.
   *
   * Los componentes utilizarán estos breakpoints
   * para adaptarse a diferentes pantallas.
   */
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  /*
   * Overrides globales de componentes MUI.
   */
  components: componentOverrides,
}


export const themeCatalog = [
  { id: 'light', label: 'Claro', description: 'La apariencia clara actual, con superficies blancas y acento verde.' },
  { id: 'dark', label: 'Oscuro', description: 'Fondos oscuros y superficies suaves para ambientes con poca luz.' },
]

const themePalettes = {
  light: { mode: 'light', primary: '#1F8A4C', primaryLight: '#4EAA72', primaryDark: '#176B3B', background: '#F5F6F8', paper: '#FFFFFF', sidebar: 'rgba(255, 255, 255, 0.76)', hover: '#EEF1F4', text: '#1F2937', secondaryText: '#6B7280', divider: '#E5E7EB' },
  dark: { mode: 'dark', primary: '#1B8247', primaryLight: '#2FB468', primaryDark: '#16683B', background: '#101311', paper: 'rgba(28, 30, 29, 0.66)', sidebar: 'rgba(24, 26, 25, 0.72)', hover: '#262A27', text: '#E8E8EA', secondaryText: '#9A9AA2', divider: 'rgba(255, 255, 255, 0.18)' },
}

export function createScgcaTheme(themeId = 'light') {
  const palette = themePalettes[themeId] ?? themePalettes.light

  return createTheme({
    ...baseTheme,
    palette: {
      mode: palette.mode,
      primary: { main: palette.primary, light: palette.primaryLight, dark: palette.primaryDark, contrastText: '#FFFFFF' },
      secondary: tokens.colors.secondary,
      background: {
        default: palette.background,
        paper: palette.paper,
      },
      text: {
        primary: palette.text,
        secondary: palette.secondaryText,
        disabled: palette.secondaryText,
      },
      divider: palette.divider,
      action: {
        hover: palette.hover ?? alpha(palette.primary, 0.08),
        selected: alpha(palette.primary, 0.12),
      },
      success: { main: tokens.colors.status.success },
      warning: { main: tokens.colors.status.warning },
      error: { main: tokens.colors.status.error },
      info: { main: tokens.colors.status.info },
    },
    scgca: {
      themeId,
      tableHover: themeId === 'dark' ? 'rgba(255, 255, 255, 0.09)' : undefined,
      surface: { ...tokens.colors.surface, sidebar: palette.sidebar },
      sidebar: palette.sidebar,
      border: { ...tokens.colors.border, main: palette.divider, light: palette.divider, dark: palette.divider },
      shadows: tokens.shadows,
    },
  })
}

export const scgcaThemes = Object.fromEntries(themeCatalog.map(({ id }) => [id, createScgcaTheme(id)]))

// Aliases kept for existing imports.
export const scgcaTheme = scgcaThemes.light
export const scgcaBlueTheme = scgcaThemes.light
