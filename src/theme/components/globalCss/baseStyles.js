// Define estilos compartidos del tema de la aplicación.
import { tokens } from '../../tokens'

export function buildBaseGlobalCss(theme, previous) {
  const dark = theme.scgca?.themeId === 'dark'
  const stageColors = (key) => {
    const stage = tokens.colors.stage[key]
    return dark
      ? { bg: stage.darkBg, text: stage.darkText, border: stage.darkBorder }
      : { bg: stage.lightBg, text: stage.lightText, border: stage.lightBorder }
  }
  const campo = stageColors('campo')
  const vivero = stageColors('vivero')
  const levante = stageColors('levante')

  return {
    ':root': {
      ...previous[':root'],
      '--bg': theme.palette.background.default,
      '--surface': theme.palette.background.paper,
      '--surface-elevated': theme.scgca?.surfaces?.elevated ?? theme.palette.background.paper,
      '--border': theme.palette.divider,
      '--text': theme.palette.text.primary,
      '--text-muted': theme.palette.text.secondary,
      '--text-disabled': theme.palette.text.disabled,
      '--primary': theme.palette.primary.main,
      '--primary-soft': theme.scgca?.primarySoft ?? 'rgba(31, 138, 76, 0.08)',
      '--primary-active-text': theme.scgca?.focusColor ?? theme.palette.primary.main,
      '--success': theme.scgca?.status?.success ?? theme.palette.success.main,
      '--warning': theme.scgca?.status?.warning ?? theme.palette.warning.main,
      '--danger': theme.scgca?.status?.error ?? theme.palette.error.main,
      '--neutral': theme.scgca?.status?.neutral ?? theme.palette.text.secondary,
      '--table-header-bg': theme.scgca?.surfaces?.elevated ?? theme.palette.background.paper,
      '--table-sticky-bg': theme.palette.background.paper,
      '--table-sticky-even-bg': theme.palette.background.paper,
      '--table-sticky-hover-bg': theme.scgca?.tableStickyHover ?? theme.palette.background.paper,
      '--table-row-divider': theme.scgca?.surfaces?.rowDivider ?? theme.palette.divider,
      '--table-selected-bg': theme.palette.action.selected,
      '--radius-card': `${tokens.radius.medium}px`,
      '--radius-control': `${tokens.radius.small}px`,
      '--stage-campo-bg': campo.bg, '--stage-campo-text': campo.text, '--stage-campo-border': campo.border,
      '--stage-vivero-bg': vivero.bg, '--stage-vivero-text': vivero.text, '--stage-vivero-border': vivero.border,
      '--stage-levante-bg': levante.bg, '--stage-levante-text': levante.text, '--stage-levante-border': levante.border,
      '--tareo-page-bg': theme.scgca?.tareo?.page ?? theme.palette.background.default,
      '--tareo-panel-bg': theme.scgca?.tareo?.panel ?? theme.palette.background.paper,
      '--tareo-border': theme.scgca?.tareo?.border ?? theme.palette.divider,
      '--tareo-table-header-bg': theme.scgca?.tareo?.tableHeader ?? theme.palette.background.paper,
      '--tareo-table-header-border': theme.scgca?.tareo?.tableHeaderBorder ?? theme.palette.divider,
      '--tareo-filter-border': theme.scgca?.tareo?.filterBorder ?? theme.palette.divider,
      '--tareo-placeholder': theme.scgca?.tareo?.placeholder ?? theme.palette.text.disabled,
      '--tareo-card-shadow': theme.scgca?.tareo?.shadow ?? 'none',
      '--tareo-tab-success-bg': theme.scgca?.tareo?.tabSuccessBg ?? theme.palette.action.hover,
      '--tareo-tab-success-text': theme.scgca?.tareo?.tabSuccessText ?? theme.palette.success.main,
      '--tareo-tab-neutral-bg': theme.scgca?.tareo?.tabNeutralBg ?? theme.palette.action.hover,
      '--tareo-tab-neutral-text': theme.scgca?.tareo?.tabNeutralText ?? theme.palette.text.secondary,
      '--tareo-tab-warning-bg': theme.scgca?.tareo?.tabWarningBg ?? theme.palette.action.hover,
      '--tareo-tab-warning-text': theme.scgca?.tareo?.tabWarningText ?? theme.palette.warning.main,
      '--tareo-primary-soft': theme.scgca?.tareo?.primarySoft ?? theme.scgca?.primarySoft,
    },
    body: { ...previous.body, backgroundColor: theme.palette.background.default, backgroundImage: 'none', color: theme.palette.text.primary, fontFamily: theme.typography.fontFamily },
    '.MuiTableCell-head': { backgroundColor: 'var(--table-header-bg) !important', backgroundImage: 'none !important', backdropFilter: 'none !important', WebkitBackdropFilter: 'none !important', opacity: '1 !important' },
    '.MuiInputBase-input::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
    'input[type="date"]::-webkit-calendar-picker-indicator, input[type="month"]::-webkit-calendar-picker-indicator': { cursor: 'pointer', filter: theme.scgca?.calendarIconFilter, opacity: 1 },
    '.app-page-header__icon .MuiSvgIcon-root': { color: theme.palette.primary.main },
  }
}
