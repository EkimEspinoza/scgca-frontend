import { supabase } from '../lib/supabase'

export async function obtenerComparativos() {
    const { data, error } = await supabase
        .from('dim_comparativo')
        .select(`
            id_comparativo,
            descripcion,
            estado,
            created_at,
            updated_at
        `)
        .order('descripcion', {
            ascending: true,
        })

    if (error) {
        console.error(
            'Error cargando comparativos:',
            error,
        )
        throw error
    }

    return data ?? []
}

export async function crearComparativo(datos) {
    const descripcion =
        datos.descripcion
            ?.trim()
            .toUpperCase()

    if (!descripcion) {
        throw new Error(
            'La descripción del comparativo es obligatoria.',
        )
    }

    const { data, error } = await supabase
        .from('dim_comparativo')
        .insert({
            descripcion,
            estado: datos.estado ?? true,
        })
        .select(`
            id_comparativo,
            descripcion,
            estado,
            created_at,
            updated_at
        `)
        .single()

    if (error) {
        console.error(
            'Error creando comparativo:',
            error,
        )
        throw error
    }

    return data
}

export async function actualizarComparativo(
    idComparativo,
    datos,
) {
    const descripcion =
        datos.descripcion
            ?.trim()
            .toUpperCase()

    if (!descripcion) {
        throw new Error(
            'La descripción del comparativo es obligatoria.',
        )
    }

    const { data, error } = await supabase
        .from('dim_comparativo')
        .update({
            descripcion,
            estado: datos.estado,
            updated_at: new Date().toISOString(),
        })
        .eq(
            'id_comparativo',
            idComparativo,
        )
        .select(`
            id_comparativo,
            descripcion,
            estado,
            created_at,
            updated_at
        `)
        .single()

    if (error) {
        console.error(
            'Error actualizando comparativo:',
            error,
        )
        throw error
    }

    return data
}
export async function cambiarEstadoComparativo(
    idComparativo,
    estado,
) {
    const { data, error } = await supabase
        .from('dim_comparativo')
        .update({
            estado,
            updated_at: new Date().toISOString(),
        })
        .eq('id_comparativo', idComparativo)
        .select(`
            id_comparativo,
            descripcion,
            estado,
            created_at,
            updated_at
        `)
        .single()

    if (error) {
        console.error('Error cambiando estado del comparativo:', error)
        throw error
    }

    return data
}
