// Encapsula las operaciones de datos de centroCostoQueryService.
import { supabase } from '../../lib/supabase'
import { convertirEstado } from './centroCostoUtils'

export async function obtenerCentrosCosto({
  empresaId = null,
  tipoCcId = null,
  tipoMaqId = null,
  comparativoId = null,
  variedadId = null,
  estado = null,
  busqueda = '',
  pagina = 1,
  registrosPorPagina = 25,
}) {

  const desde =
    (pagina - 1) *
    registrosPorPagina

  const hasta =
    desde +
    registrosPorPagina -
    1


  /*
   * =======================================================
   * CONSULTA BASE
   * =======================================================
   */

  let query = supabase
    .from('dim_centro_costo')
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
        updated_at,

        empresa:Dim_Empresa!fk_centro_costo_empresa(
          id_empresa,
          descripcion,
          nombre_comercial
        ),

        tipo_cc:Dim_TipoCC(
          id_tip_cc,
          des_tip_cc
        ),

        tipo_maq:dim_tipo_maq(
          id_tipo_maq,
          des_tipo_maquinaria
        ),

        comparativo:dim_comparativo(
          id_comparativo,
          descripcion
        ),

        variedad:dim_variedad(
          id_variedad,
          descripcion
        )
      `,
      {
        count: 'exact',
      },
    )


  /*
   * =======================================================
   * FILTRO EMPRESA
   * =======================================================
   */

  if (empresaId !== null) {
    query = query.eq(
      'id_empresa',
      empresaId,
    )
  }


  /*
   * =======================================================
   * FILTRO ESTADO
   * =======================================================
   */

  if (estado !== null) {
    query = query.eq(
      'estado',
      convertirEstado(estado),
    )
  }


  /*
   * =======================================================
   * FILTRO TIPO CENTRO DE COSTO
   * =======================================================
   */

  if (tipoCcId !== null) {
    query = query.eq(
      'id_tip_cc',
      tipoCcId,
    )
  }


  /*
   * =======================================================
   * FILTRO TIPO MAQUINARIA
   * =======================================================
   */

  if (tipoMaqId !== null) {
    query = query.eq(
      'id_tipo_maq',
      tipoMaqId,
    )
  }


  /*
   * =======================================================
   * FILTRO COMPARATIVO
   * =======================================================
   */

  if (comparativoId !== null) {
    query = query.eq(
      'id_comparativo',
      comparativoId,
    )
  }


  /*
   * =======================================================
   * FILTRO VARIEDAD
   * =======================================================
   */

  if (variedadId !== null) {
    query = query.eq(
      'id_variedad',
      variedadId,
    )
  }


  if (busqueda?.trim()) {
    const texto = busqueda.trim()
    const textoParaFiltro = texto
      .replace(/[\\%_]/g, '\\$&')
      .replace(/"/g, '\\"')
    const condiciones = [
      `desc_cc.ilike."%${textoParaFiltro}%"`,
    ]

    if (/^\d+$/.test(texto)) {
      const codigo = Number(texto)
      if (Number.isSafeInteger(codigo)) {
        condiciones.push(`cod_cc.eq.${codigo}`)
      }
    }

    query = query.or(condiciones.join(','))
  }


  /*
   * =======================================================
   * PAGINACIÓN DIRECTA EN SUPABASE
   * =======================================================
   */

  query = query
    .order(
      'id_empresa',
    )
    .order(
      'desc_cc',
    )
    .order(
      'cod_cc',
    )
    .range(
      desde,
      hasta,
    )


  const {
    data,
    error,
    count,
  } = await query


  if (error) {
    throw error
  }


  return {
    data:
      data ?? [],

    count:
      count ?? 0,
  }
}


/*
 * =========================================================
 * OBTENER OPCIONES DE FILTROS
 * =========================================================
 *
 * REGLA:
 *
 * 1. Empresa + Estado
 *    → determina los TIPOS DE CENTRO DE COSTO.
 *
 * 2. Empresa + Estado + Tipo CC
 *    → determina los filtros dependientes:
 *      - Tipo de maquinaria
 *      - Comparativo
 *      - Variedad
 *
 * IMPORTANTE:
 *
 * El Tipo CC NO se filtra por sí mismo.
 * Esto permite cambiar de un tipo a otro
 * sin tener que limpiar todos los filtros.
 * =========================================================
 */

