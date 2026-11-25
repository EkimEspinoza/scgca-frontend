// Presenta la tabla de TipoCambio.
import { Box, Divider, IconButton, Paper, Typography } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import DataTable from './common/DataTable'
import Pagination from './common/Pagination'
import { formatearFecha, formatearPeriodo, formatearTipoCambio } from '../hooks/tipoCambioFormatters'

function TipoCambioTable({ rows, loading, busqueda, total, pagina, registrosPorPagina, onEdit, onPageChange, onRowsPerPageChange }) {
  const columnas = [
    {
      key: 'periodo', label: 'Período', width: '24%',
      cellSx: { position: 'relative', pl: 1.5, '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: 'primary.main' } },
      render: (registro) => <Box><Typography variant="body2" fontWeight={600}>{formatearPeriodo(registro.anho, registro.mes)}</Typography><Typography variant="caption" color="text.secondary">{registro.anho}-{String(registro.mes).padStart(2, '0')}</Typography></Box>,
    },
    { key: 'tipo_cambio', label: 'Tipo de cambio', width: '24%', render: (registro) => <Typography variant="body2" fontWeight={700}>S/ {formatearTipoCambio(registro.tipo_cambio)}</Typography> },
    { key: 'updated_at', label: 'Última actualización', width: '24%', render: (registro) => <Typography variant="body2" color="text.secondary">{formatearFecha(registro.updated_at || registro.created_at)}</Typography> },
    {
      key: 'acciones', label: 'Acciones', width: '12%', align: 'center',
      render: (registro) => <IconButton size="small" aria-label="Editar tipo de cambio" onClick={() => onEdit(registro)} sx={{ p: 0.5, '&:hover': { backgroundColor: 'action.hover' } }}><EditIcon fontSize="small" /></IconButton>,
    },
  ]

  return (
    <Paper elevation={0} sx={{ width: '100%', minWidth: 0, minHeight: 300, flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
      <Divider />
      <DataTable columns={columnas} rows={rows} loading={loading} emptyMessage="No existen tipos de cambio registrados." emptySearchMessage="No se encontraron tipos de cambio para la búsqueda." hasSearch={Boolean(busqueda.trim())} getRowKey={(registro) => registro.id_tipo_cambio} />
      <Pagination total={total} pagina={pagina} registrosPorPagina={registrosPorPagina} onPageChange={onPageChange} onRowsPerPageChange={onRowsPerPageChange} />
    </Paper>
  )
}

export default TipoCambioTable
