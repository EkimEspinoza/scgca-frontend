// Gestiona el contexto compartido de useAuth.
import { useContext } from 'react'
import { AuthContext } from './authContextStore'

export function useAuth() {
  return useContext(AuthContext)
}
