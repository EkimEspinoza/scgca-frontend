// Define estilos compartidos del tema de la aplicación.
import { globalOverrides } from './components/global'
import { surfaceOverrides } from './components/surfaces'
import { formOverrides } from './components/forms'
import { tableOverrides } from './components/tables'
import { navigationOverrides } from './components/navigation'
import { applyGlobalCssOverrides } from './components/globalCss'
import { applyFinalComponentOverrides } from './components/finalOverrides'

export const componentOverrides = {
  ...globalOverrides,
  ...surfaceOverrides,
  ...formOverrides,
  ...tableOverrides,
  ...navigationOverrides,
}

applyGlobalCssOverrides(componentOverrides)
applyFinalComponentOverrides(componentOverrides)

export default componentOverrides
