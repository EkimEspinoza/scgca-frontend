// Presenta la tabla de TareoResumen.
import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography } from '@mui/material'

const nombreMes = new Intl.DateTimeFormat('es-PE', { month: 'long' })

export default function TareoResumenTable({ filas = [], cargando = false }) {
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(25)
  const [orden, setOrden] = useState({ campo: 'empresa', direccion: 'asc' })
  const filasOrdenadas = useMemo(() => [...filas].sort((a, b) => {
    const empresaA = a.empresa?.nombre_comercial ?? a.empresa?.descripcion ?? ''
    const empresaB = b.empresa?.nombre_comercial ?? b.empresa?.descripcion ?? ''
    const empresaCmp = empresaA.localeCompare(empresaB, 'es-PE', { sensitivity: 'base' })
    let comparacion = 0
    if (orden.campo === 'empresa') comparacion = empresaCmp
    else if (orden.campo === 'cantidad') comparacion = Number(a.cantidad_registros ?? 0) - Number(b.cantidad_registros ?? 0)
    else comparacion = String(a.periodo ?? '').localeCompare(String(b.periodo ?? ''))
    if (comparacion === 0 && orden.campo !== 'empresa') comparacion = empresaCmp
    return orden.direccion === 'asc' ? comparacion : -comparacion
  }), [filas, orden])
  const filasVisibles = filasOrdenadas.slice(pagina * filasPorPagina, (pagina + 1) * filasPorPagina)
  const totalRegistros = filas.reduce((total, fila) => total + Number(fila.cantidad_registros ?? 0), 0)
  useEffect(() => { setPagina(0) }, [filas])
  const cambiarOrden = (campo) => {
    setOrden((actual) => ({ campo, direccion: actual.campo === campo && actual.direccion === 'asc' ? 'desc' : 'asc' }))
    setPagina(0)
  }
  const encabezadoOrdenable = (label, campo, alineacion = 'left') => (
    <TableCell align={alineacion} sortDirection={orden.campo === campo ? orden.direccion : false}>
      <TableSortLabel
        active={orden.campo === campo}
        direction={orden.campo === campo ? orden.direccion : 'asc'}
        onClick={() => cambiarOrden(campo)}
        sx={{ '& .MuiTableSortLabel-icon': { opacity: 0.45 }, '&.Mui-active .MuiTableSortLabel-icon': { opacity: 1 } }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  )

  return (
    <Card className="tareo-table-card" sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
      <TableContainer sx={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }}>
        <Table stickyHeader size="small" aria-label="Resumen mensual de registros de Tareo">
          <TableHead><TableRow>
            {encabezadoOrdenable('Empresa', 'empresa')}{encabezadoOrdenable('Año', 'anio')}{encabezadoOrdenable('Mes', 'mes')}{encabezadoOrdenable('Cantidad de registros', 'cantidad', 'right')}
          </TableRow></TableHead>
          <TableBody>
            {cargando && Array.from({ length: 5 }, (_, index) => <TableRow key={`skeleton-${index}`}>{Array.from({ length: 4 }, (_, cell) => <TableCell key={cell}><Skeleton /></TableCell>)}</TableRow>)}
            {!cargando && filasVisibles.map((fila) => (
              <TableRow hover key={`${fila.id_empresa}-${fila.periodo}`}>
                <TableCell>{fila.empresa?.nombre_comercial || fila.empresa?.descripcion || `Empresa ${fila.id_empresa}`}</TableCell>
                <TableCell>{String(fila.periodo ?? '').slice(0, 4)}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{fila.periodo ? nombreMes.format(new Date(`${fila.periodo}T00:00:00`)) : '—'}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{Number(fila.cantidad_registros ?? 0).toLocaleString('es-PE')}</TableCell>
              </TableRow>
            ))}
            {!cargando && filas.length === 0 && <TableRow><TableCell colSpan={4}><Box sx={{ py: 5, textAlign: 'center' }}><Typography color="text.secondary">No hay registros para el periodo seleccionado.</Typography></Box></TableCell></TableRow>}
            {!cargando && <TableRow sx={{ position: 'sticky', bottom: 0, zIndex: 3, '& .MuiTableCell-root': { bgcolor: 'background.paper', fontWeight: 700, borderTop: '2px solid', borderColor: 'divider' } }}>
              <TableCell colSpan={3}>Total general</TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{totalRegistros.toLocaleString('es-PE')}</TableCell>
            </TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filas.length}
        page={Math.min(pagina, Math.max(0, Math.ceil(filas.length / filasPorPagina) - 1))}
        onPageChange={(_event, value) => setPagina(value)}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={(event) => { setFilasPorPagina(Number(event.target.value)); setPagina(0) }}
        rowsPerPageOptions={[25, 50, 100]}
        labelRowsPerPage="Filas por página"
      />
    </Card>
  )
}
