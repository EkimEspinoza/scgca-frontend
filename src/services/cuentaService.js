// Encapsula las consultas de cuentas y sus catálogos relacionados.
import { supabase } from '../lib/supabase'

export async function obtenerCuentas() {
  const [{ data: cuentas, error }, { data: empresas, error: errorEmpresas }, { data: comparativos, error: errorComparativos }] = await Promise.all([
    supabase.from('Dim_Cuenta').select('ID_CUENTA, Id_Empresa, CUENTA, CUENTA_PK, DESCRIPCION_CUENTA, Id_Cuenta_Comparativo, estado, created_at, updated_at').order('ID_CUENTA'),
    supabase.from('Dim_Empresa').select('id_empresa, descripcion, nombre_comercial, estado'),
    supabase.from('Dim_Cuenta_Comparativo').select('Id_Cuenta_Comparativo, Des_Cuenta_Comparativo, estado'),
  ])
  if (error) throw error
  if (errorEmpresas) throw errorEmpresas
  if (errorComparativos) throw errorComparativos
  const empresaMap = new Map((empresas ?? []).map((empresa) => [Number(empresa.id_empresa), empresa]))
  const comparativoMap = new Map((comparativos ?? []).map((comparativo) => [Number(comparativo.Id_Cuenta_Comparativo), comparativo.Des_Cuenta_Comparativo]))
  return {
    empresas: empresas ?? [],
    comparativos: comparativos ?? [],
    cuentas: (cuentas ?? []).map((cuenta) => ({
    ...cuenta,
    empresaNombre: empresaMap.get(Number(cuenta.Id_Empresa))?.nombre_comercial || empresaMap.get(Number(cuenta.Id_Empresa))?.descripcion || `Empresa ${cuenta.Id_Empresa}`,
    comparativoNombre: comparativoMap.get(Number(cuenta.Id_Cuenta_Comparativo)) ?? '',
    })),
  }
}

const CAMPOS_CUENTA = 'ID_CUENTA, Id_Empresa, CUENTA, CUENTA_PK, DESCRIPCION_CUENTA, Id_Cuenta_Comparativo, estado, created_at, updated_at'

function validarCuenta(datos) {
  const cuenta = Number(datos.CUENTA)
  const cuentaPk = Number(datos.CUENTA_PK)
  const empresa = Number(datos.Id_Empresa)
  const comparativo = Number(datos.Id_Cuenta_Comparativo)
  if (!Number.isInteger(empresa) || empresa <= 0) throw new Error('Selecciona una empresa válida.')
  if (!Number.isInteger(cuenta) || cuenta <= 0) throw new Error('Ingresa un código de cuenta válido.')
  if (!Number.isInteger(cuentaPk) || cuentaPk <= 0) throw new Error('Ingresa un código de cuenta global válido.')
  if (!datos.DESCRIPCION_CUENTA?.trim()) throw new Error('La descripción de la cuenta es obligatoria.')
  if (!Number.isInteger(comparativo) || comparativo <= 0) throw new Error('Selecciona una cuenta comparativo válida.')
  return { Id_Empresa: empresa, CUENTA: cuenta, CUENTA_PK: cuentaPk, DESCRIPCION_CUENTA: datos.DESCRIPCION_CUENTA.trim(), Id_Cuenta_Comparativo: comparativo }
}

export async function crearCuenta(datos) {
  const { data, error } = await supabase.from('Dim_Cuenta').insert({ ...validarCuenta(datos), estado: 1 }).select(CAMPOS_CUENTA).single()
  if (error) throw error
  return data
}

export async function actualizarCuenta(id, datos) {
  const { data, error } = await supabase.from('Dim_Cuenta').update(validarCuenta(datos)).eq('ID_CUENTA', Number(id)).select(CAMPOS_CUENTA).single()
  if (error) throw error
  return data
}

export async function cambiarEstadoCuenta(id, estado) {
  const { data, error } = await supabase.from('Dim_Cuenta').update({ estado: Number(estado) }).eq('ID_CUENTA', Number(id)).select(CAMPOS_CUENTA).single()
  if (error) throw error
  return data
}
