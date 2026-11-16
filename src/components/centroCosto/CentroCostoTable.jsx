import {
  Box,
  Divider,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { useMemo, useState } from 'react'

const centroCostoCollator = new Intl.Collator('es-PE', { numeric: true, sensitivity: 'base' })

function CentroCostoTable({ centros, loading, total, pagina, registrosPorPagina, onChangePagina, onChangeRegistrosPorPagina, onEditar, onCambiarEstado, cambiandoEstado = false }) {
  const [orden, setOrden] = useState({ campo: '', direccion: 'asc' })
  const camposOrden = {
    empresa: (centro) => centro.empresa?.nombre_comercial,
    codigo: (centro) => centro.cod_cc,
    descripcion: (centro) => centro.desc_cc,
    tipo: (centro) => centro.tipo_cc?.des_tip_cc,
    maquinaria: (centro) => centro.tipo_maq?.des_tipo_maquinaria,
    comparativo: (centro) => centro.comparativo?.descripcion,
    variedad: (centro) => centro.variedad?.descripcion,
    estado: (centro) => centro.estado,
  }

  const centrosOrdenados = useMemo(() => {
    if (!orden.campo) return centros
    const obtenerValor = camposOrden[orden.campo]
    const factor = orden.direccion === 'asc' ? 1 : -1
    return [...centros].sort((a, b) => centroCostoCollator.compare(String(obtenerValor(a) ?? ''), String(obtenerValor(b) ?? '')) * factor)
  }, [centros, orden])

  const cambiarOrden = (campo) => setOrden((actual) => ({
    campo,
    direccion: actual.campo === campo && actual.direccion === 'asc' ? 'desc' : 'asc',
  }))

  const encabezadoOrdenable = (texto, campo, width, align = 'left') => {
    const activo = orden.campo === campo
    return (
      <TableCell align={align} sortDirection={activo ? orden.direccion : false} aria-sort={activo ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'} sx={{ width, fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', py: 0.5 }}>
        <Tooltip title="Ordenar ascendente o descendente" enterDelay={500}>
          <TableSortLabel
            active={activo}
            direction={activo ? orden.direccion : 'asc'}
            onClick={() => cambiarOrden(campo)}
            aria-label={`Ordenar por ${texto}${activo ? `, ${orden.direccion === 'asc' ? 'ascendente' : 'descendente'}` : ''}`}
          >
            {texto}
          </TableSortLabel>
        </Tooltip>
      </TableCell>
    )
  }

  // Devuelve el color de acento asociado a la empresa.
  const obtenerColorEmpresa = (nombreComercial) => {
    const nombre = (nombreComercial || '').toUpperCase()
    if (nombre.includes('RANCHO')) return '#1976D2'
    if (nombre.includes('MOCHE') || nombre.includes('SAMNSA')) return '#2E7D32'
    if (nombre.includes('MCR')) return '#9C27B0'
    if (nombre.includes('CANTERA')) return '#ED6C02'
    return '#BDBDBD'
  }

  // Devuelve el color de texto asociado al tipo de centro de costo.
  const obtenerColorTipoCC = (tipo) => {
    const nombre = (tipo || '').toUpperCase()
    if (nombre === 'MAQUINARIAS Y EQUIPOS') return '#1976D2'
    if (nombre === 'LEVANTE Y MANTENIMIENTO') return '#2E7D32'
    if (nombre === 'INVERSIÓN E INSTALACIÓN CAMPO') return '#E65100'
    if (nombre === 'VIVEROS') return '#8E24AA'
    if (nombre.includes('ADMINISTRATIVO')) return '#546E7A'
    if (nombre === 'GENÉRICO') return '#607D8B'
    if (nombre.includes('OTROS COSTOS')) return '#795548'
    return '#374151'
  }

  const mostrarValor = (valor) => valor || '-'

  return (
    <Paper elevation={0} sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper' }}>
      {/* Las tarjetas se muestran en pantallas pequeñas. */}
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', gap: 0.75, flex: '1 1 0%', minHeight: 0, overflowY: 'auto', p: 0.75 }}>
        {loading ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>Cargando centros de costo...</Typography>
        ) : centros.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>No se encontraron centros de costo.</Typography>
        ) : centrosOrdenados.map((centro) => (
          <Paper key={centro.cod_cc_pk} variant="outlined" sx={{ p: 1.25, borderRadius: 1.25, borderLeft: `3px solid ${obtenerColorEmpresa(centro.empresa?.nombre_comercial)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{mostrarValor(centro.desc_cc)}</Typography>
                <Typography variant="caption" color="text.secondary">Código {centro.cod_cc}</Typography>
              </Box>
              <IconButton size="small" onClick={() => onEditar(centro)} aria-label={`Editar Centro de Costo ${centro.cod_cc}`}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ mt: 0.75, mb: 0.75 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title={centro.estado ? 'Desactivar Centro de Costo' : 'Activar Centro de Costo'}>
                  <span>
                    <Switch checked={Boolean(centro.estado)} onChange={() => onCambiarEstado(centro)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${centro.estado ? 'Desactivar' : 'Activar'} Centro de Costo ${centro.cod_cc}` }} />
                  </span>
                </Tooltip>
                <Typography variant="body2" fontWeight={600} color={centro.estado ? 'success.dark' : 'text.secondary'}>{centro.estado ? 'Activo' : 'Inactivo'}</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 0.75 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 1.25, rowGap: 0.75 }}>
              {[
                ['Empresa', centro.empresa?.nombre_comercial],
                ['Tipo de centro', centro.tipo_cc?.des_tip_cc],
                ['Tipo de maquinaria', centro.tipo_maq?.des_tipo_maquinaria],
                ['Comparativo', centro.comparativo?.descripcion],
                ['Variedad', centro.variedad?.descripcion],
              ].map(([etiqueta, valor]) => (
                <Box key={etiqueta} sx={{ minWidth: 0 }}>
                  <Typography component="div" variant="caption" color="text.secondary">{etiqueta}</Typography>
                  <Typography component="div" variant="body2" title={valor || ''} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mostrarValor(valor)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      <TableContainer className="app-data-table" sx={{ width: '100%', flex: '1 1 0%', minWidth: 0, minHeight: 0, overflowX: 'auto', overflowY: 'auto', display: { xs: 'none', lg: 'block' } }}>
        <Table stickyHeader size="small" sx={{ width: '100%', tableLayout: 'fixed', '& .MuiTableHead-root .MuiTableCell-root': { fontSize: '12px', px: 1, py: 0.6 } }}>
          <TableHead>
            <TableRow>
              {encabezadoOrdenable('Empresa', 'empresa', '12%')}
              {encabezadoOrdenable('Código CC', 'codigo', '8%')}
              {encabezadoOrdenable('Descripción', 'descripcion', '21%')}
              {encabezadoOrdenable('Tipo CC', 'tipo', '13%')}
              {encabezadoOrdenable('Tipo Maquinaria', 'maquinaria', '13%')}
              {encabezadoOrdenable('Comparativo', 'comparativo', '9%')}
              {encabezadoOrdenable('Variedad', 'variedad', '7%')}
              {encabezadoOrdenable('Estado', 'estado', '8%', 'center')}
              <TableCell align="center" sx={{ width: '8%', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', py: 0.5 }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><Typography variant="body2" color="text.secondary">Cargando centros de costo...</Typography></TableCell></TableRow>
            ) : centros.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}><Typography variant="body2" color="text.secondary">No se encontraron centros de costo.</Typography></TableCell></TableRow>
            ) : centrosOrdenados.map((centro) => {
              const colorEmpresa = obtenerColorEmpresa(centro.empresa?.nombre_comercial)
              const tipoCC = centro.tipo_cc?.des_tip_cc
              const colorTipoCC = obtenerColorTipoCC(tipoCC)

              return (
                <TableRow
                  key={centro.cod_cc_pk}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: '#F8FAF9' },
                    '& td': { borderBottom: '1px solid #E8ECEA' },
                    '&:last-child td': { borderBottom: 'none' },
                    '&&& td:first-of-type': { borderLeft: `4px solid ${colorEmpresa}` },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={centro.empresa?.nombre_comercial}>{mostrarValor(centro.empresa?.nombre_comercial)}</Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{centro.cod_cc}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={centro.desc_cc}>{mostrarValor(centro.desc_cc)}</Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colorTipoCC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tipoCC}>{mostrarValor(tipoCC)}</Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={centro.tipo_maq?.des_tipo_maquinaria}>{mostrarValor(centro.tipo_maq?.des_tipo_maquinaria)}</Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={centro.comparativo?.descripcion}>{mostrarValor(centro.comparativo?.descripcion)}</Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={centro.variedad?.descripcion}>{mostrarValor(centro.variedad?.descripcion)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title={centro.estado ? 'Desactivar Centro de Costo' : 'Activar Centro de Costo'}>
                        <span>
                          <Switch checked={Boolean(centro.estado)} onChange={() => onCambiarEstado(centro)} disabled={cambiandoEstado} size="small" inputProps={{ 'aria-label': `${centro.estado ? 'Desactivar' : 'Activar'} Centro de Costo ${centro.cod_cc}` }} />
                        </span>
                      </Tooltip>
                      <Typography variant="body2" fontWeight={600} color={centro.estado ? 'success.dark' : 'text.secondary'}>{centro.estado ? 'Activo' : 'Inactivo'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" className="app-table-action-cell">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
                      <Tooltip title="Editar Centro de Costo" arrow>
                        <IconButton size="small" onClick={() => onEditar(centro)} aria-label="Editar Centro de Costo">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={pagina}
        onPageChange={onChangePagina}
        rowsPerPage={registrosPorPagina}
        onRowsPerPageChange={onChangeRegistrosPorPagina}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Registros por página"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        sx={{
          borderTop: '1px solid #E8ECEA',
          flexShrink: 0,
          '& .MuiTablePagination-toolbar': { minHeight: 48, px: { xs: 0.5, sm: 1.5 }, flexWrap: { xs: 'wrap', sm: 'nowrap' }, justifyContent: { xs: 'center', sm: 'flex-end' } },
          '& .MuiTablePagination-selectLabel': { fontSize: '12px' },
          '& .MuiTablePagination-displayedRows': { fontSize: '12px' },
          '& .MuiTablePagination-select': { fontSize: '12px' },
        }}
      />
    </Paper>
  )
}

export default CentroCostoTable
