import { useContext } from 'react'
import { EmpresaContext } from './empresaContextStore'

export function useEmpresa() {
  return useContext(EmpresaContext)
}
