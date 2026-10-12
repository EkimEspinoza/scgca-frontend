export const TIPOS_CC_PERMITIDOS = [
    'LEVANTE Y MANTENIMIENTO',
    'INVERSIÓN E INSTALACIÓN CAMPO',
    'INVERSIÓN E INSTALACIÓN INFRAESTRUCTURA',
    'OTROS COSTOS',
    'VIVEROS',
]
export function esTipoCentroCostoPermitido(
    tipoCentroCosto,
) {
    if (!tipoCentroCosto) {
        return false
    }
    return TIPOS_CC_PERMITIDOS.includes(
        tipoCentroCosto
            .trim()
            .toUpperCase(),
    )
}
export function validarFormularioCampana(
    formulario,
) {
    if (
        !formulario.id_campana_emp
    ) {
        return 'El ID de campaña de la empresa es obligatorio.'
    }
    if (
        !formulario.id_empresa
    ) {
        return 'Debe seleccionar una empresa.'
    }
    if (
        !formulario.cod_cc_pk
    ) {
        return 'Debe seleccionar un Centro de Costo.'
    }
    if (
        !formulario.fecha_inicio
    ) {
        return 'La fecha de inicio es obligatoria.'
    }
    if (
        !formulario.fecha_fin
    ) {
        return 'La fecha de fin es obligatoria.'
    }
    if (
        formulario.fecha_inicio <
        '2015-01-01'
    ) {
        return 'La fecha de inicio no puede ser anterior al 01/01/2015.'
    }
    if (
        formulario.fecha_fin <
        formulario.fecha_inicio
    ) {
        return 'La fecha de fin no puede ser anterior a la fecha de inicio.'
    }
    if (
        !formulario.fecha_inicio_ctb
    ) {
        return 'La fecha de inicio CTB es obligatoria.'
    }
    if (
        !formulario.fecha_fin_ctb
    ) {
        return 'La fecha de fin CTB es obligatoria.'
    }
    if (
        formulario.fecha_fin_ctb <
        formulario.fecha_inicio_ctb
    ) {
        return 'La fecha de fin CTB no puede ser anterior a la fecha de inicio CTB.'
    }
    if (
        formulario.hectareas === '' ||
        formulario.hectareas === null ||
        formulario.hectareas === undefined
    ) {
        return 'Las hectáreas son obligatorias.'
    }
    const hectareas = Number(
        formulario.hectareas,
    )
    if (
        Number.isNaN(hectareas) ||
        hectareas < 0
    ) {
        return 'Las hectáreas deben ser un número mayor o igual a 0.'
    }
    return ''
}
export function construirDatosCampana(
    formulario,
) {
    return {
        id_campana_emp:
            Number(
                formulario.id_campana_emp,
            ),
        id_empresa:
            Number(
                formulario.id_empresa,
            ),
        cod_cc_pk:
            Number(
                formulario.cod_cc_pk,
            ),
        fecha_inicio:
            formulario.fecha_inicio,
        fecha_fin:
            formulario.fecha_fin,
        fecha_inicio_ctb:
            formulario.fecha_inicio_ctb,
        fecha_fin_ctb:
            formulario.fecha_fin_ctb,
        hectareas:
            Number(
                formulario.hectareas,
            ),
        estado:
            Boolean(
                formulario.estado,
            ),
        cierre_camp:
            Boolean(
                formulario.cierre_camp,
            ),
    }
}
export function traducirErrorCampana(
    mensaje,
) {
    if (
        mensaje.includes(
            'No se puede crear una campaña para un Centro de Costo inactivo',
        )
    ) {
        return 'No se puede crear una campaña porque el Centro de Costo está inactivo.'
    }
    if (
        mensaje.includes(
            'no permite registrar campañas',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'no pertenece a la empresa seleccionada',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'se superpone con otra campaña',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'se superpone con otro período CTB',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'debe iniciar el día siguiente',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'debe terminar el día anterior',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'duplicate key',
        )
    ) {
        return 'El ID de campaña de la empresa ya existe para esta empresa.'
    }
    if (
        mensaje.includes(
            'No se puede cambiar la empresa',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'No se puede cambiar el código',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'No se puede cambiar el tipo',
        )
    ) {
        return mensaje
    }
    if (
        mensaje.includes(
            'No se puede cambiar el código interno',
        )
    ) {
        return mensaje
    }
    return mensaje
}
export function obtenerMensajeErrorCampana(
    error,
) {
    const mensaje =
        error?.message ||
        error?.error_description ||
        'Ocurrió un error inesperado.'
    return traducirErrorCampana(
        mensaje,
    )
}