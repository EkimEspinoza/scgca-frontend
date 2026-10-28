import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'
import { AuthContext } from './authContextStore'
import { createLatestRequestGuard } from './latestRequestGuard'

function perfilesIguales(a, b) {
  return Boolean(
    a &&
    b &&
    a.id_usuario === b.id_usuario &&
    a.auth_user_id === b.auth_user_id &&
    a.nombre === b.nombre &&
    a.apellido === b.apellido &&
    a.estado === b.estado &&
    a.id_permiso === b.id_permiso &&
    a.permiso?.id_permiso === b.permiso?.id_permiso &&
    a.permiso?.nombre === b.permiso?.nombre &&
    a.permiso?.descripcion === b.permiso?.descripcion &&
    a.permiso?.estado === b.permiso?.estado
  )
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileRequestGuard] = useState(() => createLatestRequestGuard())
  const authUserIdRef = useRef(null)

  /*
   * Carga inicial o revalidación del perfil.
   * background=true evita desmontar las rutas durante la revalidación
   * de la misma cuenta al volver a la pestaña.
   */
  const cargarPerfil = useCallback(async (
    authUser,
    { background = false } = {},
  ) => {
    const requestVersion = profileRequestGuard.next()

    if (!authUser) {
      setPerfil(null)
      setLoading(false)
      return null
    }

    if (!background) {
      setPerfil(null)
      setLoading(true)
    }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(
          'id_usuario, auth_user_id, nombre, apellido, estado, id_permiso, permiso (id_permiso, nombre, descripcion, estado)',
        )
        .eq('auth_user_id', authUser.id)
        .maybeSingle()

      if (!profileRequestGuard.isCurrent(requestVersion)) return null

      if (error) {
        console.error('Error cargando perfil:', error)

        // En una carga inicial se bloquea el acceso si no pudo verificarse.
        // Durante un fallo temporal de red se conserva el perfil ya verificado.
        if (!background) setPerfil(null)
        return null
      }

      // Un resultado vacío confirma que ya no existe un perfil asociado.
      if (!data) {
        setPerfil(null)
        return null
      }

      setPerfil((perfilActual) =>
        perfilesIguales(perfilActual, data)
          ? perfilActual
          : data,
      )

      return data
    } catch (error) {
      if (profileRequestGuard.isCurrent(requestVersion)) {
        console.error('Error cargando perfil:', error)
        if (!background) setPerfil(null)
      }
      return null
    } finally {
      if (
        !background &&
        profileRequestGuard.isCurrent(requestVersion)
      ) {
        setLoading(false)
      }
    }
  }, [profileRequestGuard])

  /*
   * Inicializa la sesión y escucha cambios de autenticación.
   */
  useEffect(() => {
    let refreshInProgress = false
    let mounted = true
    let authEventVersion = 0

    const iniciar = async () => {
      const versionAtStart = authEventVersion

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error
        if (!mounted || versionAtStart !== authEventVersion) return

        const authUser = data.session?.user ?? null

        setUser(authUser)
        authUserIdRef.current = authUser?.id ?? null

        await cargarPerfil(authUser)
      } catch (error) {
        console.error('Error inicializando autenticación:', error)

        if (mounted && versionAtStart === authEventVersion) {
          profileRequestGuard.invalidate()
          setUser(null)
          authUserIdRef.current = null
          setPerfil(null)
          setLoading(false)
        }
      }
    }

    iniciar()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventVersion += 1
      const authUser = session?.user ?? null
      const mismaCuenta =
        Boolean(authUser) &&
        authUser.id === authUserIdRef.current

      if (!mismaCuenta) {
        setUser(authUser)
        authUserIdRef.current = authUser?.id ?? null
      }

      // Una renovación de token de la misma cuenta revalida sin desmontar
      // las rutas. Cambiar de cuenta sigue usando la carga bloqueante.
      void cargarPerfil(authUser, {
        background: mismaCuenta,
      })
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
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error
        if (!mounted || versionAtStart !== authEventVersion) return

        const authUser = data.session?.user ?? null
        const mismaCuenta =
          Boolean(authUser) &&
          authUser.id === authUserIdRef.current

        if (!mismaCuenta) {
          setUser(authUser)
          authUserIdRef.current = authUser?.id ?? null
        }

        await cargarPerfil(authUser, {
          background: mismaCuenta,
        })
      } catch (error) {
        // Conserva la sesión visible ante un fallo temporal al recuperar
        // el foco. La próxima revalidación volverá a comprobar el perfil.
        console.error('Error revalidando perfil al volver:', error)
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    setUser(data.user)
    authUserIdRef.current = data.user?.id ?? null

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
    profileRequestGuard.invalidate()
    setUser(null)
    authUserIdRef.current = null
    setPerfil(null)
    setLoading(false)

    const { error } = await supabase.auth.signOut()

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
