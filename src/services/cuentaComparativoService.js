// Encapsula las operaciones de datos del catálogo Dim_Cuenta_Comparativo.
import { supabase } from '../lib/supabase'

const CAMPOS_CUENTA_COMPARATIVO = 'Id_Cuenta_Comparativo, Des_Cuenta_Comparativo, Id_Tipo_Cuenta, estado, created_at, updated_at'

export async function obtenerCuentasComparativo() {
  const [{ data, error }, { data: tipos, error: errorTipos }] = await Promise.all([
    supabase.from('Dim_Cuenta_Comparativo').select(CAMPOS_CUENTA_COMPARATIVO).order('Id_Cuenta_Comparativo'),
    supabase.from('Dim_TipoCuenta').select('Id_Tipo_Cuenta, DESCRIPCION_TIPO_CUENTA'),
  ])
  if (error) throw error
  if (errorTipos) throw errorTipos
  const tiposPorId = new Map((tipos ?? []).map((tipo) => [Number(tipo.Id_Tipo_Cuenta), tipo.DESCRIPCION_TIPO_CUENTA]))
  return (data ?? []).map((cuenta) => ({ ...cuenta, tipoCuentaDescripcion: tiposPorId.get(Number(cuenta.Id_Tipo_Cuenta)) ?? '' }))
}

export async function obtenerTiposCuentaActivos() {
  const { data, error } = await supabase.from('Dim_TipoCuenta').select('Id_Tipo_Cuenta, DESCRIPCION_TIPO_CUENTA, estado').order('Id_Tipo_Cuenta')
  if (error) throw error
  return data ?? []
}

export async function crearCuentaComparativo(datos) {
  const descripcion = datos.Des_Cuenta_Comparativo?.trim()
  if (!descripcion) throw new Error('La descripción de la cuenta comparativo es obligatoria.')
  const { data, error } = await supabase.from('Dim_Cuenta_Comparativo').insert({
    Des_Cuenta_Comparativo: descripcion,
    Id_Tipo_Cuenta: Number(datos.Id_Tipo_Cuenta),
    estado: 1,
  }).select(CAMPOS_CUENTA_COMPARATIVO).single()
  if (error) throw error
  return data
}

export async function actualizarCuentaComparativo(id, datos) {
  const descripcion = datos.Des_Cuenta_Comparativo?.trim()
  if (!descripcion) throw new Error('La descripción de la cuenta comparativo es obligatoria.')
  const { data, error } = await supabase.from('Dim_Cuenta_Comparativo').update({
    Des_Cuenta_Comparativo: descripcion,
    Id_Tipo_Cuenta: Number(datos.Id_Tipo_Cuenta),
  }).eq('Id_Cuenta_Comparativo', Number(id)).select(CAMPOS_CUENTA_COMPARATIVO).single()
  if (error) throw error
  return data
}

export async function cambiarEstadoCuentaComparativo(id, estado) {
  const { data, error } = await supabase.from('Dim_Cuenta_Comparativo').update({ estado: Number(estado) })
    .eq('Id_Cuenta_Comparativo', Number(id)).select(CAMPOS_CUENTA_COMPARATIVO).single()
  if (error) throw error
  return data
}
