import { supabase } from '../lib/supabase'

// =========================================================
// CONFIGURACIÓN
// =========================================================

const TABLA = 'TipoCambio'
const FUNCION_BCRP = 'consultar-tipo-cambio-bcrp'

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
// CONSULTAR TIPO DE CAMBIO EN EL BCRP
//
// La Edge Function consulta la fuente oficial.
// Esta operación no inserta ningún registro.
// =========================================================

/**
 * Solicita el tipo de cambio del siguiente período.
 *
 * Si el BCRP todavía no publicó el dato, se genera un
 * mensaje controlado para mostrarlo en la interfaz.
 */
export async function consultarTipoCambioBCRP() {
    // Determinar el período que corresponde consultar.
    const periodo = await obtenerSiguientePeriodo()

    if (periodo.requiereInicializacion) {
        throw new Error(
            'No existe un histórico inicial. Debes cargar los períodos históricos antes de consultar el siguiente mes.'
        )
    }

    // Invocar la Edge Function de Supabase.
    const { data, error } = await supabase.functions.invoke(
        FUNCION_BCRP,
        {
            body: {
                anho: periodo.anho,
                mes: periodo.mes
            }
        }
    )

    // Gestionar errores HTTP o de comunicación.
    if (error) {
        console.error(
            '[TipoCambio] Error consultando el BCRP:',
            error
        )

        // Intentar recuperar el detalle de la respuesta HTTP.
        if (error.context) {
            try {
                const detalle = await error.context.clone().text()
                console.error('[TipoCambio] Estado HTTP:', error.context.status)
                console.error('[TipoCambio] Detalle de respuesta:', detalle)
            } catch (detalleError) {
                console.error('[TipoCambio] No se pudo leer el detalle:', detalleError)
            }
        }
        throw new Error(`No se pudo consultar el BCRP: ${error.message}`)
    }

    // Registrar la respuesta para facilitar el diagnóstico.
    console.log('[TipoCambio] Respuesta de la función:', data)

    // Gestionar períodos que el BCRP todavía no ha publicado.
    // La Edge Function devuelve HTTP 200 en este escenario.
    if (data?.disponible === false) {
        throw new Error(
            data.mensaje ||
            `El tipo de cambio de ${String(periodo.mes).padStart(2, '0')}/${periodo.anho} aún no está disponible en el BCRP. Intenta nuevamente más adelante.`
        )
    }

    // Gestionar errores de negocio devueltos por la función.
    if (data?.error) { throw new Error(data.error) }

    // Validar que la respuesta corresponda al período esperado.
    if (
        !data ||
        data.disponible !== true ||
        Number(data.anho) !== periodo.anho ||
        Number(data.mes) !== periodo.mes ||
        !Number.isFinite(Number(data.tipo_cambio)) ||
        Number(data.tipo_cambio) <= 0
    ) {
        throw new Error(
            'La respuesta del BCRP no contiene un tipo de cambio válido para el período solicitado.'
        )
    }

    // Devolver la propuesta sin guardar en la base de datos.
    return {
        ...data,
        anho: Number(data.anho),
        mes: Number(data.mes),
        tipo_cambio: Number(data.tipo_cambio)
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
        tipo_cambio: Number(datos.tipo_cambio)
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
        actualizacion.tipo_cambio = valor
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
