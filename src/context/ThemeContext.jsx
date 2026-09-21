import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

import {
  scgcaTheme,
  scgcaBlueTheme,
} from '../theme'

import {
  CssBaseline,
  ThemeProvider,
} from '@mui/material'


const ThemeContext = createContext()


/*
 * Catálogo de temas disponibles.
 *
 * Más adelante podremos agregar nuevos temas
 * sin modificar la lógica principal del Provider.
 */
const THEMES = {
  green: scgcaTheme,
  blue: scgcaBlueTheme,
}


export function AppThemeProvider({ children }) {
  /*
   * Tema actual de la aplicación.
   *
   * Por ahora:
   * green = Corporate Green
   */
  const [themeName, setThemeName] = useState('green')


  /*
   * Obtiene el objeto Theme de MUI
   * correspondiente al tema seleccionado.
   */
  const theme = useMemo(() => {
    return THEMES[themeName] ?? THEMES.green
  }, [themeName])


  /*
   * Cambia el tema de la aplicación.
   *
   * Más adelante podremos agregar aquí:
   * - validaciones
   * - persistencia en localStorage
   * - preferencia del usuario
   * - temas adicionales
   */
  const cambiarTema = (nuevoTema) => {
    if (!THEMES[nuevoTema]) {
      console.warn(
        `El tema "${nuevoTema}" no está registrado.`
      )

      return
    }

    setThemeName(nuevoTema)
  }


  /*
   * Valores disponibles para los componentes
   * que necesiten conocer o cambiar el tema.
   */
  const contextValue = useMemo(() => ({
    themeName,
    cambiarTema,
  }), [themeName])


  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}


export function useAppTheme() {
  return useContext(ThemeContext)
}