// Encapsula las operaciones de datos de centroCostoMutationService.
import { supabase } from '../../lib/supabase'

export async function crearCentroCosto({
  id_empresa,
  cod_cc,
  descripcionBase,
  id_tip_cc,
  id_tipo_maq = null,
  id_comparativo = null,
  id_variedad = null,
  estado = true,
}) {

  const empresa =
    Number(id_empresa)

  const codigo =
    Number(cod_cc)

  if (!Number.isSafeInteger(empresa) || empresa <= 0) {
    throw new Error(
      'La empresa seleccionada no tiene un identificador válido.',
    )
  }

  if (!Number.isSafeInteger(codigo) || codigo < 0) {
    throw new Error(
      'El código del Centro de Costo debe ser un número entero mayor o igual a cero.',
    )
  }

  if (
    typeof descripcionBase !== 'string' ||
    !descripcionBase.trim()
  ) {
    throw new Error(
      'La descripción del Centro de Costo es obligatoria.',
    )
  }


  /*
   * Regla:
   *
   * cod_cc_pk se genera concatenando id_empresa + cod_cc.
   * Se conserva la regla histórica; no se modifican claves ya guardadas.
   */

  const codCcPk = Number(`${empresa}${codigo}`)

  if (!Number.isSafeInteger(codCcPk)) {
    throw new Error(
      'No se pudo generar una clave válida para el Centro de Costo.',
    )
  }


  const registro = {

    cod_cc_pk:
      codCcPk,

    id_empresa:
      empresa,

    cod_cc:
      codigo,

    desc_cc:
      `${descripcionBase.trim()} (${codigo})`,

    id_tip_cc:
      Number(id_tip_cc),

    id_tipo_maq:
      id_tipo_maq !== null &&
      id_tipo_maq !== ''
        ? Number(id_tipo_maq)
        : null,

    id_comparativo:
      id_comparativo !== null &&
      id_comparativo !== ''
        ? Number(id_comparativo)
        : null,

    id_variedad:
      id_variedad !== null &&
      id_variedad !== ''
        ? Number(id_variedad)
        : null,

    estado:
      Boolean(estado),
  }


  const {
    data,
    error,
  } = await supabase
    .from(
      'dim_centro_costo',
    )
    .insert(registro)
    .select(
      `
        cod_cc_pk,
        id_empresa,
        cod_cc,
        desc_cc,
        id_tip_cc,
        id_tipo_maq,
        id_comparativo,
        id_variedad,
        estado,
        created_at,
        updated_at
      `,
    )
    .single()


  if (error) {
    throw error
  }


  return data
}


/*
 * =========================================================
 * ACTUALIZAR CENTRO DE COSTO
 * =========================================================
 *
 * NO SE MODIFICAN:
 *
 * - cod_cc_pk
 * - id_empresa
 * - cod_cc
 *
 * SÍ SE MODIFICAN:
 *
 * - desc_cc
 * - id_tip_cc
 * - id_tipo_maq
 * - id_comparativo
 * - id_variedad
 * - estado
 * =========================================================
 */


export async function actualizarCentroCosto({
  codCcPk,
  codCc,
  descripcionBase,
  id_tip_cc,
  id_tipo_maq = null,
  id_comparativo = null,
  id_variedad = null,
  estado = true,
}) {

  /*
   * =======================================================
   * VALIDACIONES
   * =======================================================
   */

  if (
    codCcPk === null ||
    codCcPk === undefined
  ) {

    throw new Error(
      'No se recibió el cod_cc_pk del Centro de Costo.',
    )

  }


  if (
    codCc === null ||
    codCc === undefined
  ) {

    throw new Error(
      'No se recibió el cod_cc del Centro de Costo.',
    )

  }


  if (
    !descripcionBase ||
    !descripcionBase.trim()
  ) {

    throw new Error(
      'La descripción del Centro de Costo es obligatoria.',
    )

  }


  if (
    id_tip_cc === null ||
    id_tip_cc === undefined ||
    id_tip_cc === ''
  ) {

    throw new Error(
      'El Tipo de Centro de Costo es obligatorio.',
    )

  }


  /*
   * =======================================================
   * REGISTRO
   * =======================================================
   */

  const registro = {

    desc_cc:
      `${descripcionBase.trim()} (${Number(codCc)})`,

    id_tip_cc:
      Number(id_tip_cc),

    id_tipo_maq:
      id_tipo_maq !== null &&
      id_tipo_maq !== ''
        ? Number(id_tipo_maq)
        : null,

    id_comparativo:
      id_comparativo !== null &&
      id_comparativo !== ''
        ? Number(id_comparativo)
        : null,

    id_variedad:
      id_variedad !== null &&
      id_variedad !== ''
        ? Number(id_variedad)
        : null,

    estado:
      Boolean(estado),

    updated_at:
      new Date().toISOString(),
  }


  /*
   * =======================================================
   * UPDATE
   * =======================================================
   */

  const {
    data,
    error,
  } = await supabase
    .from(
      'dim_centro_costo',
    )
    .update(registro)
    .eq(
      'cod_cc_pk',
      Number(codCcPk),
    )
    .select(
      `
        cod_cc_pk,
        id_empresa,
        cod_cc,
        desc_cc,
        id_tip_cc,
        id_tipo_maq,
        id_comparativo,
        id_variedad,
        estado,
        created_at,
        updated_at
      `,
    )
    .single()


  if (error) {
    throw error
  }


  if (!data) {

    throw new Error(
      'No se encontró el Centro de Costo que se intenta actualizar.',
    )

  }


  return data
}


/*
 * =========================================================
 * OBTENER CENTROS DE COSTO PARA EXPORTACIÓN
 * =========================================================
 *
 * IMPORTANTE:
 *
 * - No utiliza la paginación de la tabla.
 * - Respeta todos los filtros actuales.
 * - Consulta Supabase en bloques de 1000 registros.
 * - Permite exportar más de 1000 registros.
 * - Respeta las políticas RLS de Supabase.
 * =========================================================
 */


export async function cambiarEstadoCentroCosto(codCcPk, estado) {
  const { data, error } = await supabase
    .from('dim_centro_costo')
    .update({
      estado: Boolean(estado),
      updated_at: new Date().toISOString(),
    })
    .eq('cod_cc_pk', Number(codCcPk))
    .select('cod_cc_pk, estado, updated_at')
    .single()

  if (error) {
    console.error('Error cambiando estado del Centro de Costo:', error)
    throw error
  }

  return data
}
