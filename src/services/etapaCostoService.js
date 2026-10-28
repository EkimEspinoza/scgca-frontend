
import { supabase } from '../lib/supabase'

export async function obtenerEtapasCosto() {
    const { data, error } = await supabase
        .from('Dim_Etapa_Costo')
        .select(`
            cod_etapa,
            etapa_costo,
            estado,
            created_at,
            updated_at
        `)
        .order('cod_etapa', { ascending: true })

    if (error) {
        console.error('Error cargando etapas de costo:', error)
        throw error
    }

    return data ?? []
}

export async function crearEtapaCosto(datos) {
    const etapaCosto = datos.etapa_costo?.trim()

    if (!etapaCosto) {
        throw new Error('El nombre de la etapa de costo es obligatorio.')
    }

    const { data, error } = await supabase
        .from('Dim_Etapa_Costo')
        .insert({
            etapa_costo: etapaCosto,
            estado: datos.estado ?? true,
        })
        .select(`
            cod_etapa,
            etapa_costo,
            estado,
            created_at,
            updated_at
        `)
        .single()

    if (error) {
        console.error('Error creando etapa de costo:', error)
        throw error
    }

    return data
}

export async function actualizarEtapaCosto(idEtapa, datos) {
    const etapaCosto = datos.etapa_costo?.trim()

    if (!etapaCosto) {
        throw new Error('El nombre de la etapa de costo es obligatorio.')
    }

    const { data, error } = await supabase
        .from('Dim_Etapa_Costo')
        .update({
            etapa_costo: etapaCosto,
            estado: datos.estado,
            updated_at: new Date().toISOString(),
        })
        .eq('cod_etapa', idEtapa)
        .select(`
            cod_etapa,
            etapa_costo,
            estado,
            created_at,
            updated_at
        `)
        .single()

    if (error) {
        console.error('Error actualizando etapa de costo:', error)
        throw error
    }

    return data
}
export async function cambiarEstadoEtapaCosto(
    codEtapa,
    estado,
) {
    const { data, error } = await supabase
        .from('Dim_Etapa_Costo')
        .update({
            estado,
            updated_at: new Date().toISOString(),
        })
        .eq('cod_etapa', codEtapa)
        .select(`
            cod_etapa,
            etapa_costo,
            estado,
            created_at,
            updated_at
        `)
        .single()

    if (error) {
        console.error('Error cambiando estado de etapa de costo:', error)
        throw error
    }

    return data
}
