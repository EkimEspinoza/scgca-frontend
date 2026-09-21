import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'


const AuthContext = createContext()


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)


  /*
   * Cargar perfil de SCGCA
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
            descripcion
          )
        `,
      )
      .eq(
        'auth_user_id',
        authUser.id,
      )
      .single()


    if (error) {
      console.error(
        'Error cargando perfil:',
        error,
      )

      setPerfil(null)

      return null
    }


    setPerfil(data)

    return data
  }


  /*
   * Inicializar sesión
   */
  useEffect(() => {
    const iniciar = async () => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession()


        if (error) {
          console.error(
            'Error obteniendo sesión:',
            error,
          )
        }


        const authUser =
          data.session?.user ?? null


        setUser(authUser)


        if (authUser) {
          await cargarPerfil(authUser)
        } else {
          setPerfil(null)
        }
      } catch (error) {
        console.error(
          'Error inicializando autenticación:',
          error,
        )

        setUser(null)
        setPerfil(null)
      } finally {
        setLoading(false)
      }
    }


    iniciar()


    /*
     * Escuchar cambios de autenticación
     */
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session,
        ) => {
          const authUser =
            session?.user ?? null


          setUser(authUser)


          if (authUser) {
            await cargarPerfil(
              authUser,
            )
          } else {
            setPerfil(null)
          }
        },
      )


    return () => {
      subscription.unsubscribe()
    }
  }, [])


  /*
   * Login
   */
  const login = async (
    email,
    password,
  ) => {
    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      )


    if (error) {
      throw error
    }


    const perfilCargado =
      await cargarPerfil(
        data.user,
      )


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
    } =
      await supabase.auth.signOut()


    if (error) {
      throw error
    }


    setUser(null)
    setPerfil(null)
  }


  /*
   * Usuario habilitado para entrar
   */
  const esUsuarioActivo =
    Boolean(
      user &&
      perfil &&
      perfil.estado === 'ACTIVO' &&
      perfil.permiso,
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


export function useAuth() {
  return useContext(AuthContext)
}