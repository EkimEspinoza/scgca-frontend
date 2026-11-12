import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'

const mensajesError = {
  HORA_CERO: 'Horas en cero',
  CENTRO_COSTO_NO_EXISTE: 'Centro de costo no existe',
  MAQUINARIA_NO_EXISTE: 'Maquinaria no existe',
  CAMPANA_NO_EXISTE: 'No existe campaña operativa para la fecha',
  CENTRO_COSTO_NO_REGISTRADO: 'Centro de costo no registrado',
  CODIGO_CENTRO_COSTO_NO_COINCIDE: 'El código del centro no coincide',
  CENTRO_COSTO_INACTIVO: 'Centro de costo inactivo',
  MAQUINARIA_NO_REGISTRADA: 'Maquinaria no registrada',
  CODIGO_MAQUINARIA_NO_COINCIDE: 'El código de maquinaria no coincide',
  MAQUINARIA_INACTIVA: 'Maquinaria inactiva',
  SIN_CAMPANA_OPERATIVA: 'No existe campaña operativa para la fecha',
}

function fechaCorta(valor) {
  if (!valor) return '—'
  const [anio, mes, dia] = valor.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

function centroLabel(centro, codigo, codigoPk) {
  const descripcion = centro?.desc_cc
  return (
    <Box>
      <Typography variant="body2" fontWeight={600}>{codigo ?? '—'}{descripcion ? ` · ${descripcion}` : ''}</Typography>
      <Typography variant="caption" color="text.secondary">PK: {codigoPk ?? '—'}</Typography>
    </Box>
  )
}

export default function TareoTable({
  filas,
  pendientes,
  cargando,
  total,
  pagina,
  filasPorPagina,
  onCambiarPagina,
  onCambiarFilasPorPagina,
  puedeEditar,
  onEditar,
}) {
  const columnas = pendientes || !puedeEditar ? 6 : 7

  return (
    <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: '1 1 auto', overflow: 'hidden', borderRadius: 1.25 }}>
      <TableContainer sx={{ flex: '1 1 0%', minHeight: 0, overflow: 'auto' }}>
        <Table stickyHeader size="small" sx={{ minWidth: 980, '& .MuiTableCell-root': { px: 1, py: 0.65 } }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Nro. parte</TableCell>
              <TableCell>Centro de costo</TableCell>
              <TableCell>Maquinaria</TableCell>
              <TableCell align="right">Horas</TableCell>
              <TableCell>Observación</TableCell>
              {!pendientes && puedeEditar && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {cargando && (
              <TableRow><TableCell colSpan={columnas} align="center"><CircularProgress size={24} sx={{ my: 2 }} /></TableCell></TableRow>
            )}
            {!cargando && filas.length === 0 && (
              <TableRow><TableCell colSpan={columnas} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No hay movimientos para mostrar con estos filtros.</Typography>
              </TableCell></TableRow>
            )}
            {!cargando && filas.map((fila) => (
              <TableRow key={fila.id_mov_tareo} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaCorta(fila.fecha_tareo)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{fila.nro_parte}</TableCell>
                <TableCell>{centroLabel(fila.centro_operativo, fila.cod_cc, fila.cod_cc_pk)}</TableCell>
                <TableCell>{centroLabel(fila.maquinaria, fila.cod_cc_maq, fila.cod_cc_pk_maq)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{Number(fila.hora).toFixed(2)}</TableCell>
                <TableCell sx={{ minWidth: 220 }}>
                  {pendientes ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(fila.errores_validacion ?? []).map((error) => (
                        <Chip key={error} size="small" color="warning" variant="outlined" label={mensajesError[error] ?? error} />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color={fila.observacion ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'pre-wrap' }}>
                      {fila.observacion?.trim() || 'Sin observación'}
                    </Typography>
                  )}
                </TableCell>
                {!pendientes && puedeEditar && (
                  <TableCell align="center">
                    <Tooltip title="Actualizar registro">
                      <IconButton size="small" aria-label={`Actualizar ${fila.nro_parte}`} onClick={() => onEditar(fila)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={pagina}
        onPageChange={onCambiarPagina}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={onCambiarFilasPorPagina}
        rowsPerPageOptions={[25, 50, 100]}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
        sx={{
          flex: '0 0 auto',
          flexShrink: 0,
          minHeight: 48,
          borderTop: 1,
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            minHeight: 48,
            px: { xs: 0.5, sm: 1.5 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            justifyContent: { xs: 'center', sm: 'flex-end' },
          },
        }}
      />
    </Paper>
  )
}
