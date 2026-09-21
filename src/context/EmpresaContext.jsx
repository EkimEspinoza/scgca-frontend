import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { useAuth } from './AuthContext'
import { obtenerEmpresas } from '../services/empresaService'

const EmpresaContext = createContext()

export function EmpresaProvider({ children }) {
  const { user, perfil, loading: authLoading } = useAuth()

  const [empresas, setEmpresas] = useState([])
  const [empresaActual, setEmpresaActual] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const esAdmin = perfil?.permiso?.nombre === 'ADMIN'

  useEffect(() => {
    const cargarEmpresas = async () => {
      if (authLoading) {
        return
      }

      if (!user || !perfil || perfil.estado !== 'ACTIVO') {
        setEmpresas([])
        setEmpresaActual(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const data = await obtenerEmpresas()

        setEmpresas(data)

        if (data.length === 0) {
          setEmpresaActual(null)
          return
        }

        // ADMIN comienza trabajando con todas las empresas.
        if (esAdmin) {
          setEmpresaActual(null)
        } else {
          // Usuario normal comienza con su única/primera empresa autorizada.
          setEmpresaActual(data[0])
        }
      } catch (err) {
        console.error('Error cargando empresas:', err)

        setError(err)
        setEmpresas([])
        setEmpresaActual(null)
      } finally {
        setLoading(false)
      }
    }

    cargarEmpresas()
  }, [user, perfil, authLoading, esAdmin])

  const cambiarEmpresa = (empresa) => {
    setEmpresaActual(empresa)
  }

  return (
    <EmpresaContext.Provider
      value={{
        empresas,
        empresaActual,
        cambiarEmpresa,
        esAdmin,
        loading,
        error,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  )
}

export function useEmpresa() {
  return useContext(EmpresaContext)
}