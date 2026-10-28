
import { supabase } from '../lib/supabase'

/**
 * ================================================================
 * OBTENER TODAS LAS CAMPAÑAS
 * ================================================================
 *
 * El acceso real está protegido por RLS:
 * únicamente ADMIN puede consultar Dim_Campaña.
 */
export async function obtenerCampanas() {
    const { data, error } = await supabase
        .from('Dim_Campana')
        .select(`
            id_campana,
            id_campana_emp,
            id_empresa,
            cod_cc_pk,
            nombre_campana,
            fecha_inicio,
            fecha_fin,
            fecha_inicio_ctb,
            fecha_fin_ctb,
            hectareas,
            estado,
            cierre_camp,
            created_at,
            updated_at,

            empresa:Dim_Empresa (
                id_empresa,
                descripcion,
                nombre_comercial
            ),

            centro_costo:dim_centro_costo (
                cod_cc_pk,
                cod_cc,
                desc_cc,
                id_tip_cc
            )
        `)
        .order('fecha_inicio', {
            ascending: true,
        })

    if (error) {
        console.error('Error cargando campañas:', error)
        throw error
    }

    return data ?? []
}


/**
 * ================================================================
 * OBTENER EMPRESAS ACTIVAS
 * ================================================================
 *
 * Se utiliza para el formulario de campañas
 * y para los filtros del módulo.
 */
export async function obtenerEmpresasActivas() {
    const { data, error } = await supabase
        .from('Dim_Empresa')
        .select(`
            id_empresa,
            descripcion,
            nombre_comercial,
            estado
        `)
        .eq('estado', true)
        .order('descripcion', {
            ascending: true,
        })

    if (error) {
        console.error('Error cargando empresas activas:', error)
        throw error
    }

    return data ?? []
}


/**
 * ================================================================
 * OBTENER CENTROS DE COSTO PARA CAMPAÑA
 * ================================================================
 *
 * Obtiene únicamente Centros de Costo:
 *
 * - de la empresa seleccionada;
 * - activos;
 * - cuyo tipo permite campañas.
 */
export async function obtenerCentrosCostoParaCampana(idEmpresa) {
    if (!idEmpresa) {
        return []
    }

    const { data, error } = await supabase
        .from('dim_centro_costo')
        .select(`
            cod_cc_pk,
            cod_cc,
            desc_cc,
            id_empresa,
            id_tip_cc,
            estado,

            tipo_centro_costo:Dim_TipoCC (
                id_tip_cc,
                des_tip_cc,
                estado
            )
        `)
        .eq('id_empresa', idEmpresa)
        .eq('estado', true)
        .order('cod_cc', {
            ascending: true,
        })

    if (error) {
        console.error('Error cargando Centros de Costo para campaña:', error)
        throw error
    }

    const tiposPermitidos = [
        'LEVANTE Y MANTENIMIENTO',
        'INVERSIÓN E INSTALACIÓN CAMPO',
        'INVERSIÓN E INSTALACIÓN INFRAESTRUCTURA',
        'OTROS COSTOS',
        'VIVEROS',
    ]

    return (data ?? []).filter((centroCosto) => {
        const tipo = centroCosto
            .tipo_centro_costo
            ?.des_tip_cc
            ?.trim()
            .toUpperCase()

        return tiposPermitidos.includes(tipo)
    })
}


/**
 * ================================================================
 * OBTENER UN CENTRO DE COSTO POR COD_CC_PK
 * ================================================================
 *
 * Se utiliza principalmente cuando Campañas
 * se abre desde un Centro de Costo específico.
 *
 * Ejemplo:
 *
 * /campanas?cod_cc_pk=105
 *
 * El cod_cc_pk permite determinar:
 *
 * - Centro de Costo
 * - Empresa
 * - Tipo de Centro de Costo
 * - Estado
 *
 * De esta manera el modo contextual no necesita
 * que el usuario vuelva a seleccionar la empresa.
 */
export async function obtenerCentroCostoParaCampana(codCcPk) {
    if (!codCcPk) {
        return null
    }

    const { data, error } = await supabase
        .from('dim_centro_costo')
        .select(`
            cod_cc_pk,
            cod_cc,
            desc_cc,
            id_empresa,
            id_tip_cc,
            estado,

            tipo_centro_costo:Dim_TipoCC (
                id_tip_cc,
                des_tip_cc,
                estado
            )
        `)
        .eq('cod_cc_pk', codCcPk)
        .maybeSingle()

    if (error) {
        console.error('Error obteniendo Centro de Costo para campaña:', error)
        throw error
    }

    return data ?? null
}


/**
 * ================================================================
 * CREAR CAMPAÑA
 * ================================================================
 *
 * nombre_campaña NO se envía desde React.
 *
 * La base de datos lo genera automáticamente
 * mediante validar_campana().
 */
export async function crearCampana(datos) {
    const idCampana = Number(`${datos.id_empresa}${datos.id_campana_emp}`)
    const { data, error } = await supabase
        .from('Dim_Campana')
        .insert({
            id_campana_emp: datos.id_campana_emp,
            id_campana: idCampana,
            id_empresa: datos.id_empresa,
            cod_cc_pk: datos.cod_cc_pk,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin,
            fecha_inicio_ctb: datos.fecha_inicio_ctb,
            fecha_fin_ctb: datos.fecha_fin_ctb,
            hectareas: datos.hectareas,
            estado: datos.estado ?? true,
            cierre_camp: datos.cierre_camp ?? false,
        })
        .select(`
            id_campana,
            id_campana_emp,
            id_empresa,
            cod_cc_pk,
            nombre_campana,
            fecha_inicio,
            fecha_fin,
            fecha_inicio_ctb,
            fecha_fin_ctb,
            hectareas,
            estado,
            cierre_camp,
            created_at,
            updated_at
        `).single()
    if (error) {console.error('Error creando campaña:', error)
        throw error}
    return data
}

/**
 * ================================================================
 * ACTUALIZAR CAMPAÑA
 * ================================================================
 *
 * El nombre tampoco se recibe desde React.
 *
 * Si cambian fechas o hectáreas,
 * Supabase lo regenera mediante el trigger.
 */
export async function actualizarCampana(idCampana, datos) {
    const { data, error } = await supabase
        .from('Dim_Campana')
        .update({
            id_campana_emp: datos.id_campana_emp,
            id_empresa: datos.id_empresa,
            cod_cc_pk: datos.cod_cc_pk,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin,
            fecha_inicio_ctb: datos.fecha_inicio_ctb,
            fecha_fin_ctb: datos.fecha_fin_ctb,
            hectareas: datos.hectareas,
            estado: datos.estado,
            cierre_camp: datos.cierre_camp,
        })
        .eq('id_campana', idCampana)
        .select(`
            id_campana,
            id_campana_emp,
            id_empresa,
            cod_cc_pk,
            nombre_campana,
            fecha_inicio,
            fecha_fin,
            fecha_inicio_ctb,
            fecha_fin_ctb,
            hectareas,
            estado,
            cierre_camp,
            created_at,
            updated_at
        `)
        .single()
    if (error) {
        console.error('Error actualizando campaña:', error)
        throw error
    }
    return data
}


/**
 * ================================================================
 * ELIMINAR CAMPAÑA
 * ================================================================
 *
 * La autorización real está protegida por RLS.
 */
export async function cambiarEstadoCampana(idCampana, estado) {
    const { data, error } = await supabase
        .from('Dim_Campana')
        .update({ estado })
        .eq('id_campana', idCampana)
        .select('id_campana, estado, updated_at')
        .single()

    if (error) {
        console.error('Error cambiando estado de campaña:', error)
        throw error
    }

    return data
}

export async function eliminarCampana(idCampana) {
    const { error } = await supabase
        .from('Dim_Campana')
        .delete()
        .eq('id_campana', idCampana)

    if (error) {
        console.error('Error eliminando campaña:', error)
        throw error
    }
}
