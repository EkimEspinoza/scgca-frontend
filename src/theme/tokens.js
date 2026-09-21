export const tokens = {
  /*
   * Escala base de espaciado.
   *
   * MUI utilizará este valor para:
   * theme.spacing(...)
   */
  spacing: 8,

  /*
   * Radios generales de la aplicación.
   */
  radius: {
    small: 8,
    medium: 12,
    large: 16,
  },

  /*
   * Colores del sistema.
   *
   * La aplicación no debería escribir estos colores
   * directamente en los componentes.
   */
  colors: {
    primary: {
      main: '#2E7D32',
      light: '#60AD5E',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#26A69A',
      light: '#64D8CB',
      dark: '#00766C',
      contrastText: '#FFFFFF',
    },

    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
      soft: '#F8FAF9',
    },

    surface: {
      white: '#FFFFFF',
      soft: '#F8FAF9',
      hover: '#F1F7F2',
      selected: '#E8F5E9',
    },

    border: {
      main: '#E0E5E2',
      light: '#E8ECEA',
      dark: '#C8D0CB',
    },

    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },

    status: {
      success: '#2E7D32',
      warning: '#ED6C02',
      error: '#D32F2F',
      info: '#1976D2',
    },

    /*
     * Estados visuales de tablas y controles.
     */
    action: {
      hover: '#F1F7F2',
      selected: '#E8F5E9',
    },
  },

  /*
   * Sombras muy suaves.
   *
   * La opción 2 utiliza tarjetas,
   * pero evita sombras fuertes.
   */
  shadows: {
    card:
      '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',

    cardHover:
      '0 4px 12px rgba(15, 23, 42, 0.08)',

    dialog:
      '0 12px 32px rgba(15, 23, 42, 0.16)',
  },
}

export default tokens