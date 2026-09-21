import { createTheme } from '@mui/material/styles'

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


/*
 * =========================================================
 * CORPORATE GREEN
 * =========================================================
 */
export const scgcaTheme = createTheme({
  ...baseTheme,

  palette: {
    mode: 'light',

    primary: tokens.colors.primary,

    secondary: tokens.colors.secondary,

    background: {
      default: tokens.colors.background.default,
      paper: tokens.colors.background.paper,
    },

    text: {
      primary: tokens.colors.text.primary,
      secondary: tokens.colors.text.secondary,
      disabled: tokens.colors.text.disabled,
    },

    divider: tokens.colors.border.main,

    action: {
      hover: tokens.colors.action.hover,
      selected: tokens.colors.action.selected,
    },

    success: {
      main: tokens.colors.status.success,
    },

    warning: {
      main: tokens.colors.status.warning,
    },

    error: {
      main: tokens.colors.status.error,
    },

    info: {
      main: tokens.colors.status.info,
    },
  },

  /*
   * Propiedades propias de SCGCA.
   *
   * Los componentes que necesiten estilos
   * adicionales podrán acceder a theme.scgca.
   */
  scgca: {
    surface: tokens.colors.surface,

    border: tokens.colors.border,

    shadows: tokens.shadows,
  },
})


/*
 * =========================================================
 * CORPORATE BLUE
 * =========================================================
 *
 * Lo mantenemos para no perder el tema que ya existe.
 * Más adelante podremos terminar de ajustarlo al mismo
 * nivel visual que Corporate Green.
 */
export const scgcaBlueTheme = createTheme({
  ...baseTheme,

  palette: {
    mode: 'light',

    primary: {
      main: '#1565C0',
      light: '#5E92F3',
      dark: '#003C8F',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#546E7A',
      light: '#819CA9',
      dark: '#29434E',
      contrastText: '#FFFFFF',
    },

    background: {
      default: tokens.colors.background.default,
      paper: tokens.colors.background.paper,
    },

    text: {
      primary: tokens.colors.text.primary,
      secondary: tokens.colors.text.secondary,
      disabled: tokens.colors.text.disabled,
    },

    divider: tokens.colors.border.main,

    action: {
      hover: '#F2F6FA',
      selected: '#E3F2FD',
    },

    success: {
      main: tokens.colors.status.success,
    },

    warning: {
      main: tokens.colors.status.warning,
    },

    error: {
      main: tokens.colors.status.error,
    },

    info: {
      main: tokens.colors.status.info,
    },
  },

  scgca: {
    surface: tokens.colors.surface,

    border: tokens.colors.border,

    shadows: tokens.shadows,
  },
})