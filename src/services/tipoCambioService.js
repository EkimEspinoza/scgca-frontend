import { supabase } from '../lib/supabase'

// =========================================================
// CONFIGURACIÓN
// =========================================================

const TABLA = 'TipoCambio'

const normalizarTipoCambio = (valor) => Number(Number(valor).toFixed(3))

// =========================================================
// CONSULTAR HISTÓRICO
// =========================================================

/**
 * Obtiene todos los registros ordenados desde el período
 * más reciente hasta el más antiguo.
 */
export async function obtenerTiposCambio() {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .order('anho', { ascending: false })
        .order('mes', { ascending: false })

    if (error) {
        throw new Error(`No se pudo consultar el histórico: ${error.message}`)
    }
    return data ?? []
}


// =========================================================
// OBTENER EL ÚLTIMO PERÍODO REGISTRADO
// =========================================================

/**
 * Recupera el período más reciente de la tabla TipoCambio.
 */
export async function obtenerUltimoTipoCambio() {
    const { data, error } = await supabase
        .from(TABLA)
        .select('anho, mes, tipo_cambio')
        .order('anho', { ascending: false })
        .order('mes', { ascending: false })
        .limit(1)
        .maybeSingle()
    if (error) {
        throw new Error(`No se pudo obtener el último período: ${error.message}`)
    }
    return data
}


// =========================================================
// CALCULAR EL SIGUIENTE PERÍODO
// =========================================================

/**
 * Calcula el mes siguiente al último período registrado.
 * Si diciembre es el último mes, avanza al año siguiente.
 */
export async function obtenerSiguientePeriodo() {
    const ultimo = await obtenerUltimoTipoCambio()

    // Si no existe histórico, se requiere una carga inicial.
    if (!ultimo) {
        return {
            anho: null,
            mes: null,
            requiereInicializacion: true
        }
    }

    const siguiente = ultimo.mes === 12
        ? {
            anho: ultimo.anho + 1,
            mes: 1
        }
        : {
            anho: ultimo.anho,
            mes: ultimo.mes + 1
        }

    return {
        ...siguiente,
        requiereInicializacion: false
    }
}


// =========================================================
// PREPARAR TIPO DE CAMBIO PARA INGRESO MANUAL
// =========================================================

/** Prepara el siguiente período con un valor inicial editable. */
export async function prepararTipoCambioManual() {
    const periodo = await obtenerSiguientePeriodo()

    if (periodo.requiereInicializacion) {
        throw new Error(
            'No existe un histórico inicial. Debes cargar los períodos históricos antes de consultar el siguiente mes.'
        )
    }

    return {
        disponible: true,
        anho: periodo.anho,
        mes: periodo.mes,
        tipo_cambio: 1,
        fuente: 'Manual'
    }
}


// =========================================================
// CREAR REGISTRO CONFIRMADO POR ADMINISTRADOR
//
// La correlatividad también se valida en PostgreSQL.
// =========================================================

/**
 * Inserta un tipo de cambio después de la confirmación
 * explícita del administrador en la interfaz.
 */
export async function crearTipoCambio(datos) {
    const registro = {
        anho: Number(datos.anho),
        mes: Number(datos.mes),
        tipo_cambio: normalizarTipoCambio(datos.tipo_cambio)
    }

    // Validar los datos antes de enviarlos a Supabase.
    if (
        !Number.isInteger(registro.anho) ||
        !Number.isInteger(registro.mes) ||
        registro.anho < 2000 ||
        registro.anho > 2100 ||
        registro.mes < 1 ||
        registro.mes > 12 ||
        !Number.isFinite(registro.tipo_cambio) ||
        registro.tipo_cambio <= 0
    ) {
        throw new Error(
            'Los datos del tipo de cambio no son válidos.'
        )
    }

    // Insertar únicamente después de la confirmación del usuario.
    const { data, error } = await supabase
        .from(TABLA)
        .insert(registro)
        .select()
        .single()

    if (error) { throw new Error(`No se pudo crear el tipo de cambio: ${error.message}`) }
    return data
}


// =========================================================
// EDITAR REGISTRO HISTÓRICO
// El año y el mes originales no se modifican.
// =========================================================

/**
 * Actualiza el tipo de cambio y/o el estado cuando se
 * proporciona explícitamente alguno de esos campos.
 */
export async function actualizarTipoCambio(idTipoCambio, datos) {
    const actualizacion = {}
    // Validar y preparar el nuevo tipo de cambio.
    if (datos.tipo_cambio !== undefined) {
        const valor = Number(datos.tipo_cambio)
        if (!Number.isFinite(valor) || valor <= 0) { throw new Error('El tipo de cambio debe ser mayor que cero.') }
        actualizacion.tipo_cambio = normalizarTipoCambio(valor)
    }

    // Evitar enviar una actualización vacía.
    if (Object.keys(actualizacion).length === 0) {
        throw new Error('No hay cambios para guardar.')
    }

    const { data, error } = await supabase
        .from(TABLA)
        .update(actualizacion)
        .eq('id_tipo_cambio', idTipoCambio)
        .select()
        .single()

    if (error) { throw new Error(`No se pudo actualizar el tipo de cambio: ${error.message}`) }
    return data
}
