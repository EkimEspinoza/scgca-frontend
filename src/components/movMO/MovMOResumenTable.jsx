import { Fragment, useState } from 'react'
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material'

const moneda = (value) => Number(value ?? 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 })
const nombreEmpresa = (fila) => fila.empresa?.nombre_comercial?.trim() || fila.empresa?.descripcion?.trim() || `Empresa ${fila.id_empresa}`
const nombreMes = (value) => new Intl.DateTimeFormat('es-PE', { month: 'long' }).format(new Date(`${value}T00:00:00`))

function totalizar(filas) {
  return filas.reduce((total, fila) => ({
    importe: total.importe + Number(fila.importe_labor ?? 0),
    ess: total.ess + Number(fila.ess_labor ?? 0),
    general: total.general + Number(fila.importe_total ?? 0),
  }), { importe: 0, ess: 0, general: 0 })
}

export default function MovMOResumenTable({ filas, cargando, error }) {
  const [orden, setOrden] = useState({ campo: 'periodo', direccion: 'desc' })
  const columnas = [
    { key: 'empresa', label: 'Empresa' },
    { key: 'periodo', label: 'Mes' },
    { key: 'importe', label: 'Importe', numeric: true },
    { key: 'ess', label: 'EsSalud', numeric: true },
    { key: 'general', label: 'Importe total', numeric: true },
  ]
  const cambiarOrden = (campo) => setOrden((actual) => ({ campo, direccion: actual.campo === campo && actual.direccion === 'desc' ? 'asc' : 'desc' }))
  const porAnio = new Map()
  for (const fila of filas) {
    const anio = fila.periodo.slice(0, 4)
    const porEmpresa = porAnio.get(anio) ?? new Map()
    const registrosEmpresa = porEmpresa.get(Number(fila.id_empresa)) ?? []
    registrosEmpresa.push(fila)
    porEmpresa.set(Number(fila.id_empresa), registrosEmpresa)
    porAnio.set(anio, porEmpresa)
  }

  return <Card className="tareo-table-card" variant="outlined" sx={{ display: 'flex', flex: '1 1 0%', minHeight: 0, flexDirection: 'column', overflow: 'hidden' }}>
    {error && <Box role="alert" sx={{ p: 1.5, color: 'error.main' }}>{error}</Box>}
    <TableContainer className="app-data-table" sx={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--mui-palette-divider) transparent' }}>
      <Table stickyHeader size="small" className="tareo-table" sx={{ minWidth: 780 }}>
        <TableHead><TableRow>{columnas.map((column) => {
          const active = orden.campo === column.key
          return <TableCell key={column.key} align={column.numeric ? 'right' : 'left'} sortDirection={active ? orden.direccion : false} aria-sort={active ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'} sx={{ whiteSpace: 'nowrap' }}>
            <TableSortLabel active={active} direction={active ? orden.direccion : 'desc'} onClick={() => cambiarOrden(column.key)}>{column.label}</TableSortLabel>
          </TableCell>
        })}</TableRow></TableHead>
        <TableBody>
          {cargando && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>Cargando resumen mensual…</TableCell></TableRow>}
          {!cargando && !filas.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No hay importes para resumir en el periodo seleccionado.</Typography></TableCell></TableRow>}
          {!cargando && [...porAnio.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([anio, empresas]) => {
            const filasAnio = [...empresas.values()].flat()
            const totalAnio = totalizar(filasAnio)
            return <Fragment key={`year-${anio}`}>
              {[...empresas.entries()].sort(([, a], [, b]) => {
                const factor = orden.direccion === 'asc' ? 1 : -1
                if (orden.campo === 'empresa') return nombreEmpresa(a[0]).localeCompare(nombreEmpresa(b[0]), 'es') * factor
                if (orden.campo === 'importe' || orden.campo === 'ess' || orden.campo === 'general') {
                  const campo = { importe: 'importe', ess: 'ess', general: 'general' }[orden.campo]
                  return (totalizar(a)[campo] - totalizar(b)[campo]) * factor
                }
                return nombreEmpresa(a[0]).localeCompare(nombreEmpresa(b[0]), 'es')
              }).map(([idEmpresa, mensual]) => {
                const sumaEmpresa = totalizar(mensual)
                const mesesOrdenados = [...mensual].sort((a, b) => {
                  const factor = orden.direccion === 'asc' ? 1 : -1
                  if (orden.campo === 'periodo') return a.periodo.localeCompare(b.periodo) * factor
                  if (orden.campo === 'importe') return (Number(a.importe_labor) - Number(b.importe_labor)) * factor
                  if (orden.campo === 'ess') return (Number(a.ess_labor) - Number(b.ess_labor)) * factor
                  if (orden.campo === 'general') return (Number(a.importe_total) - Number(b.importe_total)) * factor
                  return a.periodo.localeCompare(b.periodo)
                })
                return <Fragment key={`empresa-${anio}-${idEmpresa}`}>
                  {mesesOrdenados.map((fila) => <TableRow hover className="tareo-row-hover" key={`${idEmpresa}-${fila.periodo}`}>
                    <TableCell>{nombreEmpresa(fila)}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{nombreMes(fila.periodo)} {anio}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{moneda(fila.importe_labor)}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{moneda(fila.ess_labor)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{moneda(fila.importe_total)}</TableCell>
                  </TableRow>)}
                  <TableRow key={`empresa-${anio}-${idEmpresa}`} sx={{ bgcolor: 'action.hover' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 600 }}>Total anual · {nombreEmpresa(mensual[0])} · {anio}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{moneda(sumaEmpresa.importe)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{moneda(sumaEmpresa.ess)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{moneda(sumaEmpresa.general)}</TableCell>
                  </TableRow>
                </Fragment>
              })}
              <TableRow key={`total-general-${anio}`} sx={{ bgcolor: 'action.selected' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 700 }}>TOTAL GENERAL {anio}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{moneda(totalAnio.importe)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{moneda(totalAnio.ess)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{moneda(totalAnio.general)}</TableCell>
              </TableRow>
            </Fragment>
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Card>
}
