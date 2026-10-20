import test from 'node:test'
import assert from 'node:assert/strict'
import {
  prepararDatosCampanasExcel,
  prepararDatosCentrosCostoExcel,
} from './excelService.js'

test('prepara centros de costo con columnas estables, relaciones y estado legible', () => {
  const [fila] = prepararDatosCentrosCostoExcel([{
    empresa: { nombre_comercial: 'Agrícola El Rancho' },
    cod_cc: 14208,
    desc_cc: 'Levante palta',
    tipo_cc: { des_tip_cc: 'LEVANTE Y MANTENIMIENTO' },
    tipo_maq: null,
    comparativo: { descripcion: 'PALTAS' },
    variedad: { descripcion: 'PALTA HASS' },
    estado: true,
  }])
  assert.deepEqual(Object.keys(fila), [
    'Empresa', 'Código CC', 'Descripción', 'Tipo CC', 'Tipo Maquinaria',
    'Comparativo', 'Variedad', 'Estado',
  ])
  assert.equal(fila.Empresa, 'Agrícola El Rancho')
  assert.equal(fila['Código CC'], 14208)
  assert.equal(fila['Tipo Maquinaria'], '')
  assert.equal(fila.Estado, 'Activo')
})

test('conserva valores vacíos y estado inactivo para centros de costo', () => {
  assert.deepEqual(prepararDatosCentrosCostoExcel([{}])[0], {
    Empresa: '', 'Código CC': '', Descripción: '', 'Tipo CC': '',
    'Tipo Maquinaria': '', Comparativo: '', Variedad: '', Estado: 'Inactivo',
  })
})

test('prepara campañas con columnas estables, hectáreas y estados', () => {
  const [fila] = prepararDatosCampanasExcel([{
    empresa: { nombre_comercial: 'Fundo Cantera' },
    id_campana: 77,
    id_campana_emp: 3,
    centro_costo: { cod_cc: 14208, desc_cc: 'Levante', tipo_cc: { des_tip_cc: 'LEVANTE' } },
    nombre_campana: '2026-2027',
    fecha_inicio: '2026-05-01',
    fecha_fin: null,
    fecha_inicio_ctb: '2026-05-01',
    fecha_fin_ctb: null,
    hectareas: 100,
    estado: true,
    cierre_camp: false,
  }])
  assert.deepEqual(Object.keys(fila), [
    'Empresa', 'ID Campaña', 'ID Campaña Empresa', 'Código CC',
    'Descripción Centro de Costo', 'Tipo CC', 'Campaña', 'Fecha Inicio',
    'Fecha Fin', 'Inicio CTB', 'Fin CTB', 'Hectáreas', 'Estado', 'Cierre',
  ])
  assert.equal(fila['ID Campaña'], 77)
  assert.equal(fila['Fecha Fin'], '')
  assert.equal(fila.Hectáreas, 100)
  assert.equal(fila.Estado, 'Activo')
  assert.equal(fila.Cierre, 'Abierta')
})

test('conserva la condición de campaña cerrada e inactiva', () => {
  const [fila] = prepararDatosCampanasExcel([{ estado: false, cierre_camp: true }])
  assert.equal(fila.Estado, 'Inactivo')
  assert.equal(fila.Cierre, 'Cerrada')
})
