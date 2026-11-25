// Gestiona el contexto compartido de useEmpresa.
import { useContext } from 'react'
import { EmpresaContext } from './empresaContextStore'

export function useEmpresa() {
  return useContext(EmpresaContext)
}
