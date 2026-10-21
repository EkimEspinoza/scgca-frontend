import {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'
import { AuthContext } from './authContextStore'


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)


  /*
   * Cargar perfil de SCGCA y estado vigente del permiso.
   * Ante cualquier error, se elimina el perfil de memoria:
   * el frontend debe fallar cerrado y no conservar permisos antiguos.
   */
  const cargarPerfil = async (authUser) => {
    if (!authUser) {
      setPerfil(null)
      return null
    }

    const {
      data,
      error,
    } = await supabase
      .from('usuarios')
      .select(
        `
          id_usuario,
          auth_user_id,
          nombre,
          apellido,
          estado,
          id_permiso,
          permiso (
            id_permiso,
            nombre,
            descripcion,
            estado
          )
        `,
      )
      .eq('auth_user_id', authUser.id)
      .single()

    if (error) {
      console.error('Error cargando perfil:', error)
      setPerfil(null)
      return null
    }

    setPerfil(data)
    return data
  }


  /*
   * Inicializar sesión y escuchar cambios de autenticación.
   */
  useEffect(() => {
    let refreshInProgress = false
    let mounted = true

    const iniciar = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        const authUser = data.session?.user ?? null
        if (!mounted) return

        setUser(authUser)

        if (authUser) {
          await cargarPerfil(authUser)
        } else {
          setPerfil(null)
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error)
        if (mounted) {
          setUser(null)
          setPerfil(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    iniciar()

    const {
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null

      setUser(authUser)

      if (authUser) {
        // Evitar llamadas innecesarias dentro del callback de Auth.
        // El perfil se consulta después de que termine el evento.
        Promise.resolve().then(() => cargarPerfil(authUser))
      } else {
        setPerfil(null)
      }
    })

    /*
     * Revalidar el perfil cuando el usuario vuelve a la pestaña
     * o ventana. loading bloquea temporalmente las rutas protegidas
     * mientras se consulta el estado actual en la base de datos.
     */
    const refrescarPerfilAlVolver = async () => {
      if (
        !mounted ||
        refreshInProgress ||
        document.visibilityState === 'hidden'
      ) {
        return
      }

      refreshInProgress = true
      setLoading(true)

      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession()

        if (error) throw error
        if (!mounted) return

        const authUser = data.session?.user ?? null
        setUser(authUser)

        if (authUser) {
          await cargarPerfil(authUser)
        } else {
          setPerfil(null)
        }
      } catch (error) {
        console.error('Error revalidando perfil al volver:', error)
        if (mounted) {
          setPerfil(null)
        }
      } finally {
        if (mounted) setLoading(false)
        refreshInProgress = false
      }
    }

    window.addEventListener('focus', refrescarPerfilAlVolver)
    document.addEventListener('visibilitychange', refrescarPerfilAlVolver)

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('focus', refrescarPerfilAlVolver)
      document.removeEventListener('visibilitychange', refrescarPerfilAlVolver)
    }
  }, [])


  /*
   * Login
   */
  const login = async (email, password) => {
    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    const perfilCargado = await cargarPerfil(data.user)

    return {
      ...data,
      perfil: perfilCargado,
    }
  }


  /*
   * Logout
   */
  const logout = async () => {
    const {
      error,
    } = await supabase.auth.signOut()

    if (error) throw error

    setUser(null)
    setPerfil(null)
  }


  /*
   * Usuario y permiso habilitados para entrar.
   */
  const esUsuarioActivo = Boolean(
    user &&
    perfil &&
    perfil.estado === 'ACTIVO' &&
    perfil.permiso &&
    perfil.permiso.estado === true,
  )


  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        loading,
        esUsuarioActivo,
        cargarPerfil,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
