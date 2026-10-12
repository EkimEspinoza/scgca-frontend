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