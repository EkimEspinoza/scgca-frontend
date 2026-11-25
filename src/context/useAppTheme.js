// Gestiona el contexto compartido de useAppTheme.
import { useContext } from 'react'
import { ThemeContext } from './themeContextStore'

export function useAppTheme() {
  return useContext(ThemeContext)
}
