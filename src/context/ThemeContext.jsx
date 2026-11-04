import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { flushSync } from 'react-dom'

import { scgcaThemes } from '../theme'

import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'

import { ThemeContext } from './themeContextStore'
import { useAuth } from './useAuth'


/* Catálogo de apariencias completas disponibles para cada usuario. */
const DEFAULT_THEME = 'light'
const THEMES = scgcaThemes


export function AppThemeProvider({ children }) {
  const { user, guardarPreferenciaTema } = useAuth()
  const storedTheme = user?.user_metadata?.app_theme
  const persistedThemeName = THEMES[storedTheme]
    ? storedTheme
    : (user?.user_metadata?.app_theme_mode === 'dark' ? 'dark' : DEFAULT_THEME)
  const [themeName, setThemeName] = useState(DEFAULT_THEME)
  const [guardandoTema, setGuardandoTema] = useState(false)

  useEffect(() => {
    setThemeName(THEMES[persistedThemeName] ? persistedThemeName : DEFAULT_THEME)
  }, [user?.id, persistedThemeName])


  /*
   * Obtiene el objeto Theme de MUI
   * correspondiente al tema seleccionado.
   */
  const theme = useMemo(() => {
    return THEMES[themeName] ?? THEMES[DEFAULT_THEME]
  }, [themeName])

  const aplicarTemaConRevelacion = useCallback((nuevoTema, origen) => {
    const x = Math.max(0, Math.min(window.innerWidth, origen?.x ?? 0))
    const y = Math.max(0, Math.min(window.innerHeight, origen?.y ?? window.innerHeight))
    const radio = Math.ceil(Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y),
    ))
    document.documentElement.style.setProperty('--theme-reveal-x', `${x}px`)
    document.documentElement.style.setProperty('--theme-reveal-y', `${y}px`)
    document.documentElement.style.setProperty('--theme-reveal-radius', `${radio}px`)

    const actualizar = () => flushSync(() => setThemeName(nuevoTema))

    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      try {
        const transition = document.startViewTransition(actualizar)
        transition.finished.catch(() => {})
        return
      } catch (error) {
        console.warn('No se pudo iniciar la animación de cambio de tema:', error)
      }
    }

    setThemeName(nuevoTema)
  }, [])


  /* Cambia el tema completo y guarda la elección en los metadatos de la cuenta. */
  const cambiarTema = useCallback(async (nuevoTema, origen) => {
    if (!THEMES[nuevoTema]) {
      console.warn(
        `El tema "${nuevoTema}" no está registrado.`
      )
      return false
    }

    aplicarTemaConRevelacion(nuevoTema, origen)
    setGuardandoTema(true)
    try {
      await guardarPreferenciaTema({ app_theme: nuevoTema })
      return true
    } catch (error) {
      aplicarTemaConRevelacion(THEMES[persistedThemeName] ? persistedThemeName : DEFAULT_THEME, origen)
      throw error
    } finally {
      setGuardandoTema(false)
    }
  }, [aplicarTemaConRevelacion, guardarPreferenciaTema, persistedThemeName])

  /*
   * Valores disponibles para los componentes
   * que necesiten conocer o cambiar el tema.
   */
  const contextValue = useMemo(() => ({
    themeName,
    cambiarTema,
    guardandoTema,
  }), [themeName, cambiarTema, guardandoTema])


  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
