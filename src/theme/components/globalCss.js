// Define estilos compartidos del tema de la aplicación.
import { buildBaseGlobalCss } from './globalCss/baseStyles'
import { buildTareoGlobalCss } from './globalCss/tareoStyles'
import { buildFilterGlobalCss } from './globalCss/filterStyles'
import { buildLayoutGlobalCss } from './globalCss/layoutStyles'

export function applyGlobalCssOverrides(componentOverrides) {
  const previousCssBaselineOverrides = componentOverrides.MuiCssBaseline.styleOverrides
  componentOverrides.MuiCssBaseline.styleOverrides = (theme) => {
    const previous = previousCssBaselineOverrides(theme)
    const filters = buildFilterGlobalCss(theme)
    const layout = buildLayoutGlobalCss(theme)
    const mobile = '@media (max-width: 767.95px)'
    return {
      ...previous,
      ...buildBaseGlobalCss(theme, previous),
      ...buildTareoGlobalCss(theme),
      ...filters,
      ...layout,
      [mobile]: { ...filters[mobile], ...layout[mobile] },
    }
  }
}
