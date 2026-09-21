import { supabase } from '../lib/supabase'

/*
 * =========================================================
 * CONVERTIR ESTADO
 * =========================================================
 */
function convertirEstado(estado) {
  if (
    estado === null ||
    estado === undefined
  ) {
    return null
  }

  if (typeof estado === 'boolean') {
    return estado
  }

  if (
    estado === 'true' ||
    estado === true
  ) {
    return true
  }

  if (
    estado === 'false' ||
    estado === false
  ) {
    return false
  }

  return Boolean(estado)
}

/*
 * =========================================================
 * OBTENER CENTROS DE COSTO
 * =========================================================
 */
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

        empresa:Dim_Empresa(
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

  /*
   * =======================================================
   * BÚSQUEDA
   *
   * Busca por:
   * - descripción
   * - código
   * =======================================================
   */
  if (busqueda?.trim()) {
    const texto =
      busqueda.trim()

    /*
     * -----------------------------------------------
     * BÚSQUEDA POR DESCRIPCIÓN
     * -----------------------------------------------
     */
    const queryDescripcion =
      supabase
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

            empresa:Dim_Empresa(
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
        .ilike(
          'desc_cc',
          `%${texto}%`,
        )

    /*
     * -----------------------------------------------
     * BÚSQUEDA POR CÓDIGO
     * -----------------------------------------------
     */
    let queryCodigo = null

    if (/^\d+$/.test(texto)) {
      queryCodigo =
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
              created_at,
              updated_at,

              empresa:Dim_Empresa(
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
          .eq(
            'cod_cc',
            Number(texto),
          )
    }

    /*
     * -----------------------------------------------
     * EJECUTAR BÚSQUEDAS
     * -----------------------------------------------
     */
    const consultas = [
      queryDescripcion,
    ]

    if (queryCodigo) {
      consultas.push(queryCodigo)
    }

    const resultados =
      await Promise.all(
        consultas,
      )

    /*
     * -----------------------------------------------
     * VALIDAR ERRORES
     * -----------------------------------------------
     */
    for (const resultado of resultados) {
      if (resultado.error) {
        throw resultado.error
      }
    }

    /*
     * -----------------------------------------------
     * ELIMINAR DUPLICADOS
     * -----------------------------------------------
     */
    const mapa = new Map()

    resultados.forEach(
      (resultado) => {
        ;(
          resultado.data ?? []
        ).forEach((item) => {
          mapa.set(
            item.cod_cc_pk,
            item,
          )
        })
      },
    )

    let datos = Array.from(
      mapa.values(),
    )

    /*
     * -----------------------------------------------
     * APLICAR FILTROS RESTANTES
     * -----------------------------------------------
     */
    if (empresaId !== null) {
      datos = datos.filter(
        (item) =>
          Number(
            item.id_empresa,
          ) ===
          Number(empresaId),
      )
    }

    if (estado !== null) {
      datos = datos.filter(
        (item) =>
          item.estado ===
          convertirEstado(estado),
      )
    }

    if (tipoCcId !== null) {
      datos = datos.filter(
        (item) =>
          Number(
            item.id_tip_cc,
          ) ===
          Number(tipoCcId),
      )
    }

    if (tipoMaqId !== null) {
      datos = datos.filter(
        (item) =>
          Number(
            item.id_tipo_maq,
          ) ===
          Number(tipoMaqId),
      )
    }

    if (comparativoId !== null) {
      datos = datos.filter(
        (item) =>
          Number(
            item.id_comparativo,
          ) ===
          Number(comparativoId),
      )
    }

    if (variedadId !== null) {
      datos = datos.filter(
        (item) =>
          Number(
            item.id_variedad,
          ) ===
          Number(variedadId),
      )
    }

    /*
     * -----------------------------------------------
     * ORDEN ALFABÉTICO
     *
     * 1. Empresa
     * 2. Descripción Centro de Costo
     * 3. Código
     * -----------------------------------------------
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
          ).toLocaleUpperCase('es')

        const descripcionB =
          String(
            b.desc_cc ?? '',
          ).toLocaleUpperCase('es')

        const comparacion =
          descripcionA.localeCompare(
            descripcionB,
            'es',
            {
              sensitivity: 'base',
            },
          )

        if (comparacion !== 0) {
          return comparacion
        }

        return (
          Number(a.cod_cc) -
          Number(b.cod_cc)
        )
      },
    )

    /*
     * -----------------------------------------------
     * TOTAL
     * -----------------------------------------------
     */
    const total =
      datos.length

    /*
     * -----------------------------------------------
     * PAGINACIÓN
     * -----------------------------------------------
     */
    const datosPaginados =
      datos.slice(
        desde,
        hasta + 1,
      )

    return {
      data: datosPaginados,
      count: total,
    }
  }

  /*
   * =======================================================
   * PAGINACIÓN DIRECTA EN SUPABASE
   *
   * Orden:
   * 1. Empresa
   * 2. Descripción
   * 3. Código
   * =======================================================
   */
  query = query
    .order('id_empresa')
    .order('desc_cc')
    .order('cod_cc')
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
    data: data ?? [],
    count: count ?? 0,
  }
}

/*
 * =========================================================
 * OBTENER OPCIONES DE FILTROS
 * =========================================================
 */
export async function obtenerOpcionesFiltros({
  empresaId = null,
  estado = null,
  tipoCcId = null,
}) {
  let query = supabase
    .from('dim_centro_costo')
    .select(
      `
        id_empresa,
        id_tip_cc,
        id_tipo_maq,
        id_comparativo,
        id_variedad,
        estado
      `,
    )

  /*
   * FILTRO EMPRESA
   */
  if (empresaId !== null) {
    query = query.eq(
      'id_empresa',
      empresaId,
    )
  }

  /*
   * FILTRO ESTADO
   */
  if (estado !== null) {
    query = query.eq(
      'estado',
      convertirEstado(estado),
    )
  }

  /*
   * FILTRO TIPO CC
   */
  if (tipoCcId !== null) {
    query = query.eq(
      'id_tip_cc',
      tipoCcId,
    )
  }

  const {
    data,
    error,
  } = await query

  if (error) {
    throw error
  }

  const registros = data ?? []

  return {
    tiposCentroCosto: [
      ...new Set(
        registros
          .map(
            (item) =>
              item.id_tip_cc,
          )
          .filter(
            (item) =>
              item !== null,
          ),
      ),
    ],

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

  /*
   * Regla:
   *
   * cod_cc_pk =
   * (id_empresa * 100000) + cod_cc
   */
  const codCcPk =
    empresa * 100000 +
    codigo

  const registro = {
    cod_cc_pk: codCcPk,

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
    .from('dim_centro_costo')
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
 * CAMPOS QUE NO SE MODIFICAN:
 *
 * - cod_cc_pk
 * - id_empresa
 * - cod_cc
 *
 * CAMPOS QUE SÍ SE MODIFICAN:
 *
 * - desc_cc
 * - id_tip_cc
 * - id_tipo_maq
 * - id_comparativo
 * - id_variedad
 * - estado
 *
 * El registro se identifica mediante
 * el cod_cc_pk original.
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
   * REGISTRO A ACTUALIZAR
   * =======================================================
   *
   * NO enviamos:
   *
   * - cod_cc_pk
   * - id_empresa
   * - cod_cc
   *
   * Por lo tanto esos campos permanecen
   * intactos en la BD.
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
    .from('dim_centro_costo')
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

  /*
   * =======================================================
   * MANEJO DE ERROR
   * =======================================================
   */
  if (error) {
    throw error
  }

  /*
   * =======================================================
   * VALIDAR QUE REALMENTE SE ACTUALIZÓ
   * =======================================================
   */
  if (!data) {
    throw new Error(
      'No se encontró el Centro de Costo que se intenta actualizar.',
    )
  }

  return data
}