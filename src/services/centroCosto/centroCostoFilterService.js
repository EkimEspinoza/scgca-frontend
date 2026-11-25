// Encapsula las operaciones de datos de centroCostoFilterService.
import { supabase } from '../../lib/supabase'
import { convertirEstado } from './centroCostoUtils'

export async function obtenerOpcionesFiltros({
  empresaId = null,
  estado = null,
  tipoCcId = null,
}) {

  /*
   * =======================================================
   * CONSULTA BASE
   *
   * Empresa + Estado
   *
   * Esta consulta determina qué Tipos CC
   * están disponibles.
   * =======================================================
   */

  let queryTipos =
    supabase
      .from(
        'dim_centro_costo',
      )
      .select(
        `
          id_tip_cc
        `,
      )


  /*
   * FILTRO EMPRESA
   */

  if (empresaId !== null) {

    queryTipos =
      queryTipos.eq(
        'id_empresa',
        empresaId,
      )

  }


  /*
   * FILTRO ESTADO
   */

  if (estado !== null) {

    queryTipos =
      queryTipos.eq(
        'estado',
        convertirEstado(
          estado,
        ),
      )

  }


  const {
    data: datosTipos,
    error: errorTipos,
  } = await queryTipos


  if (errorTipos) {
    throw errorTipos
  }


  /*
   * =======================================================
   * TIPOS DE CENTRO DE COSTO
   * =======================================================
   */

  const tiposCentroCosto = [
    ...new Set(
      (datosTipos ?? [])
        .map(
          (item) =>
            item.id_tip_cc,
        )
        .filter(
          (item) =>
            item !== null,
        ),
    ),
  ]


  /*
   * =======================================================
   * SI NO HAY TIPO CC SELECCIONADO
   *
   * No necesitamos buscar todavía
   * los filtros dependientes.
   * =======================================================
   */

  if (
    tipoCcId === null
  ) {

    return {
      tiposCentroCosto,

      tiposMaquinaria: [],

      comparativos: [],

      variedades: [],
    }

  }


  /*
   * =======================================================
   * CONSULTA DEPENDIENTE
   *
   * Empresa + Estado + Tipo CC
   *
   * Esta consulta solamente determina
   * las opciones de los filtros secundarios.
   * =======================================================
   */

  let queryDependientes =
    supabase
      .from(
        'dim_centro_costo',
      )
      .select(
        `
          id_tipo_maq,
          id_comparativo,
          id_variedad
        `,
      )


  /*
   * FILTRO EMPRESA
   */

  if (empresaId !== null) {

    queryDependientes =
      queryDependientes.eq(
        'id_empresa',
        empresaId,
      )

  }


  /*
   * FILTRO ESTADO
   */

  if (estado !== null) {

    queryDependientes =
      queryDependientes.eq(
        'estado',
        convertirEstado(
          estado,
        ),
      )

  }


  /*
   * FILTRO TIPO CC
   */

  queryDependientes =
    queryDependientes.eq(
      'id_tip_cc',
      tipoCcId,
    )


  const {
    data: datosDependientes,
    error: errorDependientes,
  } =
    await queryDependientes


  if (errorDependientes) {
    throw errorDependientes
  }


  const registros =
    datosDependientes ?? []


  /*
   * =======================================================
   * RETORNAR OPCIONES
   * =======================================================
   */

  return {

    /*
     * Siempre conserva todos
     * los tipos disponibles
     * según Empresa + Estado.
     */
    tiposCentroCosto,

    /*
     * Opciones dependientes
     * del Tipo CC seleccionado.
     */
    tiposMaquinaria: [
      ...new Set(
        registros
          .map(
            (item) =>
              item.id_tipo_maq,
          )
          .filter(
            (item) =>
              item !== null,
          ),
      ),
    ],

    comparativos: [
      ...new Set(
        registros
          .map(
            (item) =>
              item.id_comparativo,
          )
          .filter(
            (item) =>
              item !== null,
          ),
      ),
    ],

    variedades: [
      ...new Set(
        registros
          .map(
            (item) =>
              item.id_variedad,
          )
          .filter(
            (item) =>
              item !== null,
          ),
      ),
    ],
  }
}


/*
 * =========================================================
 * CREAR CENTRO DE COSTO
 * =========================================================
 */

