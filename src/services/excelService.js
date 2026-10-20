import * as XLSX from 'xlsx'

export function prepararDatosCentrosCostoExcel(centros) {
  return centros.map((centro) => ({
    Empresa: centro.empresa?.nombre_comercial ?? '',
    'Código CC': centro.cod_cc ?? '',
    Descripción: centro.desc_cc ?? '',
    'Tipo CC': centro.tipo_cc?.des_tip_cc ?? '',
    'Tipo Maquinaria': centro.tipo_maq?.des_tipo_maquinaria ?? '',
    Comparativo: centro.comparativo?.descripcion ?? '',
    Variedad: centro.variedad?.descripcion ?? '',
    Estado: centro.estado ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosCampanasExcel(campanas) {
  return campanas.map((campana) => ({
    Empresa: campana.empresa?.nombre_comercial ?? '',
    'ID Campaña': campana.id_campana ?? '',
    'ID Campaña Empresa': campana.id_campana_emp ?? '',
    'Código CC': campana.centro_costo?.cod_cc ?? '',
    'Descripción Centro de Costo': campana.centro_costo?.desc_cc ?? '',
    'Tipo CC': campana.centro_costo?.tipo_cc?.des_tip_cc ?? '',
    Campaña: campana.nombre_campana ?? '',
    'Fecha Inicio': campana.fecha_inicio ?? '',
    'Fecha Fin': campana.fecha_fin ?? '',
    'Inicio CTB': campana.fecha_inicio_ctb ?? '',
    'Fin CTB': campana.fecha_fin_ctb ?? '',
    Hectáreas: campana.hectareas ?? '',
    Estado: campana.estado ? 'Activo' : 'Inactivo',
    Cierre: campana.cierre_camp ? 'Cerrada' : 'Abierta',
  }))
}

function descargarExcel(datos, nombreHoja, nombreArchivo, anchosColumnas) {
  const hoja = XLSX.utils.json_to_sheet(datos)
  hoja['!cols'] = anchosColumnas.map((wch) => ({ wch }))
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja)
  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`)
}

export function exportarCentrosCostoExcel(centros, nombreArchivo = 'Centros_de_Costo') {
  descargarExcel(
    prepararDatosCentrosCostoExcel(centros),
    'Centros de Costo',
    nombreArchivo,
    [18, 12, 45, 28, 25, 20, 25, 12],
  )
}

export function exportarCampanasExcel(campanas, nombreArchivo = 'Campanas') {
  descargarExcel(
    prepararDatosCampanasExcel(campanas),
    'Campañas',
    nombreArchivo,
    [18, 12, 18, 12, 40, 28, 45, 14, 14, 14, 14, 12, 12, 12],
  )
}
