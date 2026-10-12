import * as XLSX from 'xlsx'


/*
 * =========================================================
 * EXPORTAR CENTROS DE COSTO A EXCEL
 * =========================================================
 */

export function exportarCentrosCostoExcel(
  centros,
  nombreArchivo = 'Centros_de_Costo',
) {

  /*
   * =======================================================
   * PREPARAR DATOS
   * =======================================================
   */

  const datosExcel = centros.map(
    (centro) => ({
      Empresa:
        centro.empresa?.nombre_comercial ??
        '',

      'Código CC':
        centro.cod_cc ??
        '',

      Descripción:
        centro.desc_cc ??
        '',

      'Tipo CC':
        centro.tipo_cc?.des_tip_cc ??
        '',

      'Tipo Maquinaria':
        centro.tipo_maq?.des_tipo_maquinaria ??
        '',

      Comparativo:
        centro.comparativo?.descripcion ??
        '',

      Variedad:
        centro.variedad?.descripcion ??
        '',

      Estado:
        centro.estado
          ? 'Activo'
          : 'Inactivo',
    }),
  )


  /*
   * =======================================================
   * CREAR HOJA
   * =======================================================
   */

  const hoja =
    XLSX.utils.json_to_sheet(
      datosExcel,
    )


  /*
   * =======================================================
   * AJUSTAR ANCHO DE COLUMNAS
   * =======================================================
   */

  hoja['!cols'] = [
    {
      wch: 18,
    },
    {
      wch: 12,
    },
    {
      wch: 45,
    },
    {
      wch: 28,
    },
    {
      wch: 25,
    },
    {
      wch: 20,
    },
    {
      wch: 25,
    },
    {
      wch: 12,
    },
  ]


  /*
   * =======================================================
   * CREAR LIBRO
   * =======================================================
   */

  const libro =
    XLSX.utils.book_new()


  /*
   * =======================================================
   * AGREGAR HOJA
   * =======================================================
   */

  XLSX.utils.book_append_sheet(
    libro,
    hoja,
    'Centros de Costo',
  )


  /*
   * =======================================================
   * GENERAR ARCHIVO
   * =======================================================
   */

  XLSX.writeFile(
    libro,
    `${nombreArchivo}.xlsx`,
  )
}
export function exportarCampanasExcel(
  campanas,
  nombreArchivo = 'Campanas',
) {

  /*
   * =======================================================
   * PREPARAR DATOS
   * =======================================================
   */

  const datosExcel = campanas.map(
    (campana) => ({
      Empresa:
        campana.empresa?.nombre_comercial ??
        '',

      'ID Campaña':
        campana.id_campana ??
        '',

      'ID Campaña Empresa':
        campana.id_campana_emp ??
        '',

      'Código CC':
        campana.centro_costo?.cod_cc ??
        '',

      'Descripción Centro de Costo':
        campana.centro_costo?.desc_cc ??
        '',

      'Tipo CC':
        campana.centro_costo?.tipo_cc?.des_tip_cc ??
        '',

      Campaña:
        campana.nombre_campana ??
        '',

      'Fecha Inicio':
        campana.fecha_inicio ??
        '',

      'Fecha Fin':
        campana.fecha_fin ??
        '',

      'Inicio CTB':
        campana.fecha_inicio_ctb ??
        '',

      'Fin CTB':
        campana.fecha_fin_ctb ??
        '',

      Hectáreas:
        campana.hectareas ??
        '',

      Estado:
        campana.estado
          ? 'Activo'
          : 'Inactivo',

      Cierre:
        campana.cierre_camp
          ? 'Cerrada'
          : 'Abierta',
    }),
  )


  /*
   * =======================================================
   * CREAR HOJA
   * =======================================================
   */

  const hoja =
    XLSX.utils.json_to_sheet(
      datosExcel,
    )


  /*
   * =======================================================
   * AJUSTAR ANCHO DE COLUMNAS
   * =======================================================
   */

  hoja['!cols'] = [
    {
      wch: 18,
    },
    {
      wch: 12,
    },
    {
      wch: 18,
    },
    {
      wch: 12,
    },
    {
      wch: 40,
    },
    {
      wch: 28,
    },
    {
      wch: 45,
    },
    {
      wch: 14,
    },
    {
      wch: 14,
    },
    {
      wch: 14,
    },
    {
      wch: 14,
    },
    {
      wch: 12,
    },
    {
      wch: 12,
    },
    {
      wch: 12,
    },
  ]


  /*
   * =======================================================
   * CREAR LIBRO
   * =======================================================
   */

  const libro =
    XLSX.utils.book_new()


  /*
   * =======================================================
   * AGREGAR HOJA
   * =======================================================
   */

  XLSX.utils.book_append_sheet(
    libro,
    hoja,
    'Campañas',
  )


  /*
   * =======================================================
   * GENERAR ARCHIVO
   * =======================================================
 */

  XLSX.writeFile(
    libro,
    `${nombreArchivo}.xlsx`,
  )
}