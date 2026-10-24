import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'
import { AuthContext } from './authContextStore'
import { createLatestRequestGuard } from './latestRequestGuard'


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileRequestGuard] = useState(() => createLatestRequestGuard())


  /*
   * Cargar el perfil vigente. Solo la solicitud más reciente puede
   * modificar el perfil o finalizar el estado de carga. Esto evita que
   * una respuesta antigua restaure permisos tras cambiar de usuario/logout.
   */
  const cargarPerfil = useCallback(async (authUser) => {
    const requestVersion = profileRequestGuard.next()

    if (!authUser) {
      setPerfil(null)
      setLoading(false)
      return null
    }

    setPerfil(null)
    setLoading(true)

    try {
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

      if (!profileRequestGuard.isCurrent(requestVersion)) return null

      if (error) {
        console.error('Error cargando perfil:', error)
        setPerfil(null)
        return null
      }

      setPerfil(data)
      return data
    } catch (error) {
      if (profileRequestGuard.isCurrent(requestVersion)) {
        console.error('Error cargando perfil:', error)
        setPerfil(null)
      }
      return null
    } finally {
      if (profileRequestGuard.isCurrent(requestVersion)) {
        setLoading(false)
      }
    }
  }, [profileRequestGuard])


  /*
   * Inicializar sesión y escuchar cambios de autenticación.
   */
  useEffect(() => {
    let refreshInProgress = false
    let mounted = true
    let authEventVersion = 0

    const iniciar = async () => {
      const versionAtStart = authEventVersion
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession()

        if (error) throw error
        if (!mounted || versionAtStart !== authEventVersion) return

        const authUser = data.session?.user ?? null
        setUser(authUser)
        await cargarPerfil(authUser)
      } catch (error) {
        console.error('Error inicializando autenticación:', error)
        if (mounted && versionAtStart === authEventVersion) {
          profileRequestGuard.invalidate()
          setUser(null)
          setPerfil(null)
          setLoading(false)
        }
      }
    }

    iniciar()

    const {
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventVersion += 1
      const authUser = session?.user ?? null

      setUser(authUser)
      // Invalidar solicitudes previas inmediatamente, incluso en logout.
      void cargarPerfil(authUser)
    })

    const refrescarPerfilAlVolver = async () => {
      if (
        !mounted ||
        refreshInProgress ||
        document.visibilityState === 'hidden'
      ) {
        return
      }

      refreshInProgress = true
      const versionAtStart = authEventVersion

      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession()

        if (error) throw error
        if (!mounted || versionAtStart !== authEventVersion) return

        const authUser = data.session?.user ?? null
        setUser(authUser)
        await cargarPerfil(authUser)
      } catch (error) {
        console.error('Error revalidando perfil al volver:', error)
        if (mounted && versionAtStart === authEventVersion) {
          profileRequestGuard.invalidate()
          setPerfil(null)
          setLoading(false)
        }
      } finally {
        refreshInProgress = false
      }
    }

    window.addEventListener('focus', refrescarPerfilAlVolver)
    document.addEventListener('visibilitychange', refrescarPerfilAlVolver)

    return () => {
      mounted = false
      profileRequestGuard.invalidate()
      subscription.unsubscribe()
      window.removeEventListener('focus', refrescarPerfilAlVolver)
      document.removeEventListener('visibilitychange', refrescarPerfilAlVolver)
    }
  }, [cargarPerfil, profileRequestGuard])


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

    setUser(data.user)
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
    // Bloquear de inmediato cualquier respuesta de perfil pendiente.
    profileRequestGuard.invalidate()
    setUser(null)
    setPerfil(null)
    setLoading(false)

    const {
      error,
    } = await supabase.auth.signOut()

    if (error) throw error
  }


  /*
   * Usuario y permiso habilitados para entrar.
   */
  const esUsuarioActivo = Boolean(
    user &&
    perfil &&
    perfil.auth_user_id === user.id &&
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
