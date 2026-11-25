// Encapsula las operaciones de datos de excelService.
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

export function prepararDatosEmpresasExcel(empresas) {
  return empresas.map((empresa) => ({
    Empresa: empresa.descripcion ?? '',
    'Nombre comercial': empresa.nombre_comercial ?? '',
    Estado: empresa.estado ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosVariedadesExcel(variedades) {
  return variedades.map((variedad) => ({
    Variedad: variedad.descripcion ?? '',
    Estado: variedad.estado ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosTiposMaquinariaExcel(tiposMaquinaria) {
  return tiposMaquinaria.map((tipo) => ({
    'Tipo de Maquinaria': tipo.des_tipo_maquinaria ?? '',
    Estado: tipo.estado ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosTiposCentroCostoExcel(tipos) {
  return tipos.map((tipo) => ({
    'Tipo de Centro de Costo': tipo.des_tip_cc ?? '',
    Estado: tipo.estado ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosEtapasCostoExcel(etapas) {
  return etapas.map((etapa) => ({
    Código: etapa.cod_etapa ?? '',
    Etapa: etapa.etapa_costo ?? '',
    Estado: etapa.estado ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosComparativosExcel(comparativos) {
  return comparativos.map((comparativo) => ({
    Comparativo: comparativo.descripcion ?? '',
    Estado: comparativo.estado ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosGruposLaborExcel(grupos) {
  return grupos.map((grupo) => ({
    Código: grupo.Id_Grupo_Labor ?? '',
    'Descripción del grupo': grupo.DescripcionLabor ?? '',
    'Tipo de grupo': grupo.TIPO_GRUPO ?? '',
    Estado: Number(grupo.estado) === 1 ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosLaboresFinalesExcel(labores) {
  return labores.map((labor) => ({
    Código: labor.Id_Lab_Fin ?? '',
    Descripción: labor.DESCRIPCION ?? '',
    'Grupo de labor': labor.grupoLabor?.DescripcionLabor ?? '',
    'Tipo de jornal': labor.tipoJornal?.Descripcion ?? labor.id_Tipo_Jornal ?? '',
    Estado: Number(labor.estado) === 1 ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosLaboresExcel(labores) {
  return labores.map((labor) => ({
    Código: labor.Id_Lab ?? '',
    'Labor (SCIRE)': labor.Lab_SCIRE ?? '',
    'Labor final': labor.laborFinal?.DESCRIPCION ?? labor.Id_Lab_Fin ?? '',
    Estado: Number(labor.estado) === 1 ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosTiposJornalExcel(tipos) {
  return tipos.map((tipo) => ({
    Código: tipo.Id_Tipo_Jornal ?? '',
    Descripción: tipo.Descripcion ?? '',
    Estado: Number(tipo.estado) === 1 ? 'Activo' : 'Inactivo',
  }))
}

export function prepararDatosJornalesExcel(periodos, tipos) {
  return periodos.map((periodo) => ({
    Inicio: periodo.Inicio ?? '',
    Fin: periodo.Fin ?? '',
    ...Object.fromEntries(tipos.map((tipo) => [tipo.Descripcion, periodo.importes[tipo.Id_Tipo_Jornal] ?? ''])),
    Estado: Number(periodo.estado) === 1 ? 'Activo' : 'Inactivo',
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

export function exportarEmpresasExcel(empresas, nombreArchivo = 'Empresas') {
  descargarExcel(
    prepararDatosEmpresasExcel(empresas),
    'Empresas',
    nombreArchivo,
    [40, 30, 14],
  )
}

export function exportarVariedadesExcel(variedades, nombreArchivo = 'Variedades') {
  descargarExcel(
    prepararDatosVariedadesExcel(variedades),
    'Variedades',
    nombreArchivo,
    [40, 14],
  )
}

export function exportarTiposMaquinariaExcel(tiposMaquinaria, nombreArchivo = 'Tipos_de_Maquinaria') {
  descargarExcel(
    prepararDatosTiposMaquinariaExcel(tiposMaquinaria),
    'Tipos de Maquinaria',
    nombreArchivo,
    [40, 14],
  )
}

export function exportarTiposCentroCostoExcel(tipos, nombreArchivo = 'Tipos_de_Centro_de_Costo') {
  descargarExcel(
    prepararDatosTiposCentroCostoExcel(tipos),
    'Tipos de Centro de Costo',
    nombreArchivo,
    [40, 14],
  )
}

export function exportarEtapasCostoExcel(etapas, nombreArchivo = 'Etapas_de_Costo') {
  descargarExcel(
    prepararDatosEtapasCostoExcel(etapas),
    'Etapas de Costo',
    nombreArchivo,
    [14, 40, 14],
  )
}

export function exportarComparativosExcel(comparativos, nombreArchivo = 'Comparativos') {
  descargarExcel(
    prepararDatosComparativosExcel(comparativos),
    'Comparativos',
    nombreArchivo,
    [40, 14],
  )
}

export function exportarGruposLaborExcel(grupos, nombreArchivo = 'Grupos_de_Labor') {
  descargarExcel(prepararDatosGruposLaborExcel(grupos), 'Grupos de Labor', nombreArchivo, [12, 42, 16, 14])
}

export function exportarLaboresFinalesExcel(labores, nombreArchivo = 'Labor_Final') {
  descargarExcel(prepararDatosLaboresFinalesExcel(labores), 'Labor Final', nombreArchivo, [12, 48, 36, 18, 14])
}

export function exportarLaboresExcel(labores, nombreArchivo = 'Labor') {
  descargarExcel(prepararDatosLaboresExcel(labores), 'Labor', nombreArchivo, [12, 55, 55, 14])
}

export function exportarTiposJornalExcel(tipos, nombreArchivo = 'Tipos_de_Jornal') {
  descargarExcel(prepararDatosTiposJornalExcel(tipos), 'Tipos de Jornal', nombreArchivo, [12, 42, 14])
}

export function exportarTiposCuentaExcel(tipos, nombreArchivo = 'Tipos_de_Cuenta') {
  const datos = tipos.map((tipo) => ({
    Código: tipo.Id_Tipo_Cuenta ?? '',
    Descripción: tipo.DESCRIPCION_TIPO_CUENTA ?? '',
    Estado: Number(tipo.estado) === 1 ? 'Activo' : 'Inactivo',
  }))
  descargarExcel(datos, 'Tipos de Cuenta', nombreArchivo, [12, 42, 14])
}

export function exportarCuentasComparativoExcel(cuentas, nombreArchivo = 'Cuentas_Comparativo') {
  const datos = cuentas.map((cuenta) => ({
    Código: cuenta.Id_Cuenta_Comparativo ?? '',
    'Cuenta Comparativo': cuenta.Des_Cuenta_Comparativo ?? '',
    'Tipo de Cuenta': cuenta.tipoCuentaDescripcion ?? '',
    Estado: Number(cuenta.estado) === 1 ? 'Activo' : 'Inactivo',
  }))
  descargarExcel(datos, 'Cuenta Comparativo', nombreArchivo, [12, 52, 34, 14])
}

export function exportarCuentasExcel(cuentas, nombreArchivo = 'Cuentas') {
  const datos = cuentas.map((cuenta) => ({
    Empresa: cuenta.empresaNombre ?? '',
    Cuenta: cuenta.CUENTA ?? '',
    'Cuenta global': cuenta.CUENTA_PK ?? '',
    Descripción: cuenta.DESCRIPCION_CUENTA ?? '',
    'Cuenta Comparativo': cuenta.comparativoNombre ?? '',
    Estado: Number(cuenta.estado) === 1 ? 'Activo' : 'Inactivo',
  }))
  descargarExcel(datos, 'Cuentas', nombreArchivo, [28, 14, 18, 48, 42, 14])
}

export function exportarJornalesExcel(periodos, tipos, nombreArchivo = 'Jornales') {
  descargarExcel(prepararDatosJornalesExcel(periodos, tipos), 'Jornales', nombreArchivo, [14, 14, ...tipos.map(() => 22), 14])
}

export function exportarMovimientosMOExcel(filas, pendientes = false) {
  const etiquetaValidacion = (error) => {
    const codigo = typeof error === 'string' ? error : error?.codigo ?? error?.code ?? error?.message ?? String(error)
    return codigo === 'SIN_CAMPANA_EN_FECHA' ? 'No existe una campaña activa para la fecha' : codigo.replaceAll('_', ' ').toLocaleLowerCase('es-PE')
  }
  const datos = filas.map((fila) => ({
    Empresa: fila.empresa?.nombre_comercial ?? fila.empresa?.descripcion ?? fila.id_empresa ?? '',
    Fecha: fila.fec_labor ?? '',
    'Tipo de centro de costo': fila.centro?.tipo_cc?.des_tip_cc ?? '',
    'Centro de costo': [fila.cod_cc, fila.centro?.desc_cc].filter(Boolean).join(' · '),
    'Grupo de labor': fila.labor?.grupo_labor?.DescripcionLabor ?? '',
    Labor: fila.labor?.DESCRIPCION ?? fila.cod_labor ?? '',
    'Labor SCIRE': fila.labor_scire ?? '',
    'Importe S/': Number(fila.imp_labor_sol ?? 0),
    'EsSalud S/': Number(fila.ess_labor_sol ?? 0),
    'Importe total S/': Number(fila.imp_labor_sol ?? 0) + Number(fila.ess_labor_sol ?? 0),
    Etapa: fila.etapa_costo_descripcion ?? fila.etapa_costo ?? '',
    Observación: fila.obs ?? '',
    Estado: Number(fila.estado) === 1 ? 'Activo' : 'Inactivo',
    ...(pendientes ? { Validación: (fila.errores_validacion ?? []).map(etiquetaValidacion).join('; ') || fila.estado_validacion || 'Pendiente de revisión' } : {}),
  }))
  const nombre = pendientes ? 'Mov_MO_Pendientes' : 'Mov_MO_Procesados'
  descargarExcel(datos, pendientes ? 'Pendientes' : 'Procesados', nombre, [24, 14, 30, 46, 36, 36, 46, 16, 16, 20, 26, 36, 14, 46])
}

export function exportarMovimientosTareoExcel(filas, pendientes = false, nombreArchivo = 'Mov_Tareo') {
  const etiquetaValidacion = (error) => {
    const codigo = typeof error === 'string' ? error : error?.codigo ?? error?.code ?? error?.message ?? String(error)
    const etiquetas = { TIPO_CENTRO_COSTO_NO_PERMITIDO: 'Tipo de centro de costo no permitido', TIPO_MAQUINARIA_NO_PERMITIDO: 'Tipo no permitido: solo maquinaria o pozos y reservorios' }
    return etiquetas[codigo] ?? (codigo === 'SIN_CAMPANA_EN_FECHA' ? 'No existe una campaña para la fecha' : codigo.replaceAll('_', ' ').toLocaleLowerCase('es-PE'))
  }
  const datos = filas.map((fila) => ({
    Empresa: fila.empresa?.nombre_comercial ?? fila.empresa?.descripcion ?? fila.id_empresa ?? '',
    Fecha: fila.fecha_tareo ?? '',
    'Nro. parte': fila.nro_parte ?? '',
    'Centro de costo': [fila.cod_cc, fila.centro_operativo?.desc_cc].filter(Boolean).join(' · '),
    Maquinaria: [fila.cod_cc_maq, fila.maquinaria?.desc_cc].filter(Boolean).join(' · '),
    Horas: Number(fila.hora ?? 0),
    Etapa: fila.etapa_tareo ?? '',
    Observación: fila.observacion ?? '',
    Estado: Number(fila.estado) === 1 ? 'Activo' : 'Inactivo',
    ...(pendientes ? { Validación: (fila.errores_validacion ?? []).map(etiquetaValidacion).join('; ') || fila.estado_validacion || 'Pendiente de revisión' } : {}),
  }))
  descargarExcel(datos, pendientes ? 'Pendientes' : 'Tareo', pendientes ? 'Mov_Tareo_Pendientes' : nombreArchivo, [24, 14, 18, 42, 42, 12, 24, 48, 14, 46])
}

export function exportarResumenMensualMOExcel(filas, nombreArchivo = 'Mov_MO_Resumen') {
  const datos = filas.map((fila) => ({
    Empresa: fila.empresa?.nombre_comercial ?? fila.empresa?.descripcion ?? fila.id_empresa ?? '',
    Año: String(fila.periodo ?? '').slice(0, 4),
    Mes: fila.periodo ? new Intl.DateTimeFormat('es-PE', { month: 'long' }).format(new Date(`${fila.periodo}T00:00:00`)) : '',
    'Importe S/': Number(fila.importe_labor ?? 0),
    'EsSalud S/': Number(fila.ess_labor ?? 0),
    'Importe total S/': Number(fila.importe_total ?? 0),
  }))
  descargarExcel(datos, 'Resumen mensual', nombreArchivo, [30, 12, 18, 18, 18, 20])
}

export function exportarResumenMensualTareoExcel(filas, nombreArchivo = 'Mov_Tareo_Resumen') {
  const datos = filas.map((fila) => ({
    Empresa: fila.empresa?.nombre_comercial ?? fila.empresa?.descripcion ?? fila.id_empresa ?? '',
    Año: String(fila.periodo ?? '').slice(0, 4),
    Mes: fila.periodo ? new Intl.DateTimeFormat('es-PE', { month: 'long' }).format(new Date(`${fila.periodo}T00:00:00`)) : '',
    'Cantidad de registros': Number(fila.cantidad_registros ?? 0),
  }))
  descargarExcel(datos, 'Resumen mensual', nombreArchivo, [32, 12, 18, 24])
}
