// Encapsula las operaciones de datos de centroCostoExportService.
import { supabase } from '../../lib/supabase'
import { convertirEstado } from './centroCostoUtils'

export async function obtenerCentrosCostoParaExportar({
  empresaId = null,
  tipoCcId = null,
  tipoMaqId = null,
  comparativoId = null,
  variedadId = null,
  estado = null,
  busqueda = '',
}) {

  /*
   * =======================================================
   * CONFIGURACIÓN DE BLOQUES
   * =======================================================
   */

  const TAMANO_BLOQUE =
    1000

  let todosLosDatos =
    []

  let desde =
    0


  /*
   * =======================================================
   * CONSULTAR POR BLOQUES
   * =======================================================
   */

  while (true) {

    const hasta =
      desde +
      TAMANO_BLOQUE -
      1


    /*
     * =====================================================
     * CONSULTA BASE
     * =====================================================
     */

    let query =
      supabase
        .from(
          'dim_centro_costo',
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
        )


    /*
     * =====================================================
     * FILTRO EMPRESA
     * =====================================================
     */

    if (empresaId !== null) {

      query =
        query.eq(
          'id_empresa',
          empresaId,
        )

    }


    /*
     * =====================================================
     * FILTRO ESTADO
     * =====================================================
     */

    if (estado !== null) {

      query =
        query.eq(
          'estado',
          convertirEstado(
            estado,
          ),
        )

    }


    /*
     * =====================================================
     * FILTRO TIPO CENTRO DE COSTO
     * =====================================================
     */

    if (tipoCcId !== null) {

      query =
        query.eq(
          'id_tip_cc',
          tipoCcId,
        )

    }


    /*
     * =====================================================
     * FILTRO TIPO MAQUINARIA
     * =====================================================
     */

    if (tipoMaqId !== null) {

      query =
        query.eq(
          'id_tipo_maq',
          tipoMaqId,
        )

    }


    /*
     * =====================================================
     * FILTRO COMPARATIVO
     * =====================================================
     */

    if (comparativoId !== null) {

      query =
        query.eq(
          'id_comparativo',
          comparativoId,
        )

    }


    /*
     * =====================================================
     * FILTRO VARIEDAD
     * =====================================================
     */

    if (variedadId !== null) {

      query =
        query.eq(
          'id_variedad',
          variedadId,
        )

    }


    /*
     * =====================================================
     * ORDEN Y BLOQUE
     * =====================================================
     */

    query =
      query
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


    /*
     * =====================================================
     * EJECUTAR CONSULTA
     * =====================================================
     */

    const {
      data,
      error,
    } = await query


    if (error) {
      throw error
    }


    const registros =
      data ?? []


    /*
     * =====================================================
     * ACUMULAR REGISTROS
     * =====================================================
     */

    todosLosDatos.push(
      ...registros,
    )


    /*
     * =====================================================
     * DETERMINAR SI TERMINAMOS
     * =====================================================
     *
     * Si recibimos menos de 1000 registros,
     * ya no existen más registros para consultar.
     * =====================================================
     */

    if (
      registros.length <
      TAMANO_BLOQUE
    ) {
      break
    }


    /*
     * =====================================================
     * SIGUIENTE BLOQUE
     * =====================================================
     */

    desde +=
      TAMANO_BLOQUE
  }


  /*
   * =======================================================
   * BÚSQUEDA
   *
   * Busca por:
   * - descripción
   * - código
   * =======================================================
   */

  let datos =
    todosLosDatos


  if (busqueda?.trim()) {

    const texto =
      busqueda
        .trim()
        .toLocaleUpperCase(
          'es',
        )


    datos =
      datos.filter(
        (item) => {

          const descripcion =
            String(
              item.desc_cc ?? '',
            )
              .toLocaleUpperCase(
                'es',
              )


          const codigo =
            String(
              item.cod_cc ?? '',
            )


          return (
            descripcion.includes(
              texto,
            ) ||
            codigo.includes(
              texto,
            )
          )

        },
      )
  }


  /*
   * =======================================================
   * ORDEN FINAL
   *
   * 1. Empresa
   * 2. Descripción
   * 3. Código
   * =======================================================
   */

  datos.sort(
    (a, b) => {

      if (
        Number(a.id_empresa) !==
        Number(b.id_empresa)
      ) {

        return (
          Number(a.id_empresa) -
          Number(b.id_empresa)
        )

      }


      const descripcionA =
        String(
          a.desc_cc ?? '',
        ).toLocaleUpperCase(
          'es',
        )


      const descripcionB =
        String(
          b.desc_cc ?? '',
        ).toLocaleUpperCase(
          'es',
        )


      const comparacion =
        descripcionA.localeCompare(
          descripcionB,
          'es',
          {
            sensitivity:
              'base',
          },
        )


      if (
        comparacion !== 0
      ) {

        return comparacion

      }


      return (
        Number(a.cod_cc) -
        Number(b.cod_cc)
      )

    },
  )


  /*
   * =======================================================
   * RESULTADO FINAL
   * =======================================================
   */

  return datos
}
/**
 * Actualiza únicamente el estado activo/inactivo de un Centro de Costo.
 */
