// Encapsula las operaciones de datos de jornalService.
import { supabase } from '../lib/supabase'

const CAMPOS_JORNAL = 'Id_Jornal, id_Tipo_Jornal, Inicio, Fin, Importe_Soles, estado, created_at, updated_at'

export async function obtenerJornales() {
  const pageSize = 1000
  const rows = []
  for (let desde = 0; ; desde += pageSize) {
    const { data, error } = await supabase.from('Dim_Jornal').select(CAMPOS_JORNAL)
      .order('Inicio', { ascending: false }).order('id_Tipo_Jornal').range(desde, desde + pageSize - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < pageSize) return rows
  }
}

export async function obtenerTiposJornalParaJornal() {
  const { data, error } = await supabase.from('Dim_TipoJornal')
    .select('Id_Tipo_Jornal, Descripcion, estado').order('Id_Tipo_Jornal', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function guardarPeriodoJornal({ inicio, fin, importes, tipos, modoEdicion, estado = 1, periodoOriginal }) {
  const rows = tipos.map((tipo) => ({
    id_Tipo_Jornal: Number(tipo.Id_Tipo_Jornal),
    Inicio: inicio,
    Fin: fin,
    Importe_Soles: Number(importes[tipo.Id_Tipo_Jornal]),
    estado: Number(estado),
  }))

  if (modoEdicion) {
    const { error } = await supabase.rpc('actualizar_periodo_jornal', {
      p_inicio_actual: periodoOriginal.inicio,
      p_fin_actual: periodoOriginal.fin,
      p_inicio_nuevo: inicio,
      p_fin_nuevo: fin,
      p_importes: importes,
    })
    if (error) throw error
    return
  }

  const { error } = await supabase.from('Dim_Jornal').insert(rows)
  if (error) throw error
}

export async function cambiarEstadoPeriodoJornal(inicio, fin, estado) {
  const { data, error } = await supabase.from('Dim_Jornal').update({ estado: Number(estado) })
    .eq('Inicio', inicio).eq('Fin', fin).select('Id_Jornal')
  if (error) throw error
  return data ?? []
}
