import { alpha, createTheme } from '@mui/material/styles'

import { tokens } from './tokens'
import { componentOverrides } from './components'

const baseTheme = {
  spacing: tokens.spacing,
  shape: { borderRadius: tokens.radius.medium },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h1: { fontSize: '2rem', lineHeight: 1.2, fontWeight: 600 },
    h2: { fontSize: '1.75rem', lineHeight: 1.25, fontWeight: 600 },
    h3: { fontSize: '1.5rem', lineHeight: 1.3, fontWeight: 600 },
    h4: { fontSize: '1.25rem', lineHeight: 1.35, fontWeight: 600 },
    h5: { fontSize: '1.125rem', lineHeight: 1.4, fontWeight: 500 },
    h6: { fontSize: '1rem', lineHeight: 1.4, fontWeight: 500 },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    subtitle1: { fontSize: '0.875rem', lineHeight: 1.4, fontWeight: 500 },
    subtitle2: { fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: 500 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4 },
    button: { fontSize: '0.875rem', textTransform: 'none', fontWeight: 500 },
  },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  components: componentOverrides,
}

export const themeCatalog = [
  { id: 'light', label: 'Claro', description: 'Superficies blancas y fondos neutros con acento verde.' },
  { id: 'dark', label: 'Oscuro', description: 'Superficies oscuras neutras con contraste suave.' },
]

const themePalettes = {
  light: {
    mode: 'light', primary: '#1F8A4C', primaryLight: '#4EAA72', primaryDark: '#176B3B',
    primarySoft: tokens.colors.theme.light.primarySoft,
    background: '#F7F8FA', paper: '#FFFFFF', sidebar: '#FFFFFF', hover: '#F4F6F8', selected: '#EEF1F4',
    text: '#202A35', secondaryText: '#667085', divider: '#E4E7EC',
    success: tokens.colors.status.success.light, warning: tokens.colors.status.warning.light,
    error: tokens.colors.status.error.light, info: tokens.colors.status.info.light,
  },
  dark: {
    mode: 'dark',
    ...tokens.colors.theme.dark,
    background: tokens.colors.theme.dark.background,
    paper: tokens.colors.theme.dark.surface,
    elevated: tokens.colors.theme.dark.elevated,
    sidebar: tokens.colors.theme.dark.surface,
    hover: tokens.colors.theme.dark.hover,
    selected: tokens.colors.theme.dark.selected,
    text: tokens.colors.theme.dark.textPrimary,
    secondaryText: tokens.colors.theme.dark.textSecondary,
    disabledText: tokens.colors.theme.dark.textDisabled,
    divider: tokens.colors.theme.dark.border,
    success: tokens.colors.status.success.dark, warning: tokens.colors.status.warning.dark,
    error: tokens.colors.status.error.dark, info: tokens.colors.status.info.dark,
  },
}

export function createScgcaTheme(themeId = 'light') {
  const palette = themePalettes[themeId] ?? themePalettes.light
  const dark = palette.mode === 'dark'

  return createTheme({
    ...baseTheme,
    palette: {
      mode: palette.mode,
      primary: { main: palette.primary, light: palette.primaryLight, dark: palette.primaryDark, contrastText: '#FFFFFF' },
      secondary: tokens.colors.secondary,
      background: { default: palette.background, paper: palette.paper },
      text: { primary: palette.text, secondary: palette.secondaryText, disabled: palette.disabledText ?? palette.secondaryText },
      divider: palette.divider,
      action: {
        hover: palette.hover ?? alpha(palette.primary, 0.06),
        selected: palette.selected ?? alpha(palette.primary, 0.08),
      },
      success: { main: palette.success },
      warning: { main: palette.warning },
      error: { main: palette.error },
      info: { main: palette.info },
    },
    scgca: {
      themeId,
      tableHover: dark ? tokens.colors.theme.dark.hover : '#F4F6F8',
      tableStickyHover: dark ? tokens.colors.theme.dark.stickyHover : tokens.colors.surface.hover,
      primarySoft: palette.primarySoft ?? (dark ? 'rgba(47, 180, 104, 0.16)' : 'rgba(31, 138, 76, 0.08)'),
      focusColor: dark ? palette.primaryLight : palette.primary,
      calendarIconFilter: dark ? tokens.colors.theme.dark.calendarIconFilter : tokens.colors.theme.light.calendarIconFilter,
      surfaces: { page: palette.background, panel: palette.paper, elevated: palette.elevated ?? palette.paper, rowDivider: dark ? tokens.colors.theme.dark.rowDivider : palette.divider },
      status: {
        success: palette.success, warning: palette.warning, error: palette.error,
        neutral: dark ? tokens.colors.status.neutral.dark : tokens.colors.status.neutral.light,
      },
      surface: { ...tokens.colors.surface, sidebar: palette.sidebar },
      sidebar: palette.sidebar,
      tareo: tokens.colors.theme[themeId]?.tareo ?? tokens.colors.theme.light.tareo,
      border: { ...tokens.colors.border, main: palette.divider, light: palette.divider, dark: palette.divider },
      shadows: tokens.shadows,
    },
  })
}

const compactThemeOptions = {
  typography: {
    h5: { fontSize: '1.25rem', '@media (max-width:599.95px)': { fontSize: '1.125rem' } },
    h4: { fontSize: '1.375rem' }, h6: { fontSize: '1rem' },
    subtitle1: { fontSize: '0.875rem' }, subtitle2: { fontSize: '0.8125rem' },
    body1: { fontSize: '0.875rem' }, body2: { fontSize: '0.875rem' }, caption: { fontSize: '0.75rem' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { minHeight: 36, fontSize: '0.875rem' } } },
    MuiInputBase: { styleOverrides: { root: { fontSize: '0.875rem' } } },
    MuiInputLabel: { styleOverrides: { root: { fontSize: '0.8125rem' } } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: '12px', minHeight: 36 } } },
    MuiOutlinedInput: { styleOverrides: { root: { '&.MuiInputBase-sizeSmall': { minHeight: 36 } } } },
    MuiTableCell: { styleOverrides: { root: { fontSize: '10px' } } },
    MuiTablePagination: { styleOverrides: { selectLabel: { fontSize: '0.75rem' }, displayedRows: { fontSize: '0.75rem' } } },
    MuiFormHelperText: { styleOverrides: { root: { fontSize: '0.75rem' } } },
    MuiChip: { styleOverrides: { label: { fontSize: '0.75rem' } } },
  },
}

export function createCompactScgcaTheme(outerTheme) {
  return createTheme(outerTheme, compactThemeOptions)
}

export const scgcaThemes = Object.fromEntries(themeCatalog.map(({ id }) => [id, createScgcaTheme(id)]))

// Aliases kept for existing imports.
export const scgcaTheme = scgcaThemes.light
export const scgcaBlueTheme = scgcaThemes.light
