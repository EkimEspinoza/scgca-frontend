import { Edit } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import DataTable from '../common/DataTable'
import Pagination from '../common/Pagination'
import StatusChip from '../common/StatusChip'

export default function EmpresaTable({
  loading,
  puedeAdministrar,
  empresasPaginados,
  totalRegistros,
  busqueda,
  filtroEstado,
  pagina,
  registrosPorPagina,
  cambiandoEstado,
  empresaCambioEstado,
  onEditar,
  onSolicitarCambioEstado,
  onChangePagina,
  onChangeRegistrosPorPagina,
  onCerrarConfirmacionEstado,
  onConfirmarCambioEstado,
}) {
  const esVistaMovil = useMediaQuery('(max-width:760px)')

  const columnas = [
    {
      key: 'descripcion',
      label: 'Empresa',
      width: 'auto',
      whiteSpace: 'nowrap',
      cellSx: {
        position: 'relative',
        pl: 1.5,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: 'primary.main',
        },
      },
      render: (empresa) => (
        <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
            {empresa.descripcion}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'nombre_comercial',
      label: 'Nombre comercial',
      width: 'auto',
      whiteSpace: 'nowrap',
      render: (empresa) => <Typography color="text.primary">{empresa.nombre_comercial}</Typography>,
    },
    {
      key: 'estado',
      label: 'Estado',
      width: 'auto',
      whiteSpace: 'nowrap',
      render: (empresa) => (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          {puedeAdministrar && (
            <Tooltip title={empresa.estado ? 'Desactivar empresa' : 'Reactivar empresa'}>
              <span>
                <Switch
                  checked={Boolean(empresa.estado)}
                  onChange={() => onSolicitarCambioEstado(empresa)}
                  disabled={cambiandoEstado}
                  size="small"
                  inputProps={{ 'aria-label': `${empresa.estado ? 'Desactivar' : 'Reactivar'} ${empresa.descripcion}` }}
                />
              </span>
            </Tooltip>
          )}
          <StatusChip estado={empresa.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
        </Box>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      width: 'auto',
      whiteSpace: 'nowrap',
      align: 'center',
      render: (empresa) => (puedeAdministrar ? (
        <Tooltip title="Editar empresa">
          <IconButton
            size="small"
            aria-label={`Editar ${empresa.descripcion}`}
            onClick={() => onEditar(empresa)}
            sx={{ p: 0.5, '&:hover': { backgroundColor: 'action.hover' } }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null),
    },
  ]

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        '& .MuiTableContainer-root': { flex: '0 1 auto', maxHeight: { xs: 420, sm: 560 } },
      }}
    >
      {esVistaMovil ? (
        <Box
          component="ul"
          aria-label="Lista de empresas"
          sx={{ listStyle: 'none', m: 0, p: 0, flex: '0 1 auto', maxHeight: 420, overflowY: 'auto' }}
        >
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : empresasPaginados.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ p: 3 }}>
              {Boolean(busqueda.trim()) || filtroEstado !== 'todos'
                ? 'No se encontraron empresas.'
                : 'No existen empresas registradas.'}
            </Typography>
          ) : empresasPaginados.map((empresa) => (
            <Box
              component="li"
              key={empresa.id_empresa}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                columnGap: 1,
                alignItems: 'center',
                px: 1.5,
                py: 1.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 0 },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                  {empresa.descripcion}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, overflowWrap: 'anywhere' }}>
                  Nombre comercial: {empresa.nombre_comercial || 'Sin especificar'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                  {puedeAdministrar && (
                    <Tooltip title={empresa.estado ? 'Desactivar empresa' : 'Reactivar empresa'}>
                      <span>
                        <Switch
                          checked={Boolean(empresa.estado)}
                          onChange={() => onSolicitarCambioEstado(empresa)}
                          disabled={cambiandoEstado}
                          size="small"
                          inputProps={{ 'aria-label': `${empresa.estado ? 'Desactivar' : 'Reactivar'} ${empresa.descripcion}` }}
                        />
                      </span>
                    </Tooltip>
                  )}
                  <StatusChip estado={empresa.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                </Box>
              </Box>
              {puedeAdministrar && (
                <Tooltip title="Editar empresa">
                  <IconButton
                    aria-label={`Editar ${empresa.descripcion}`}
                    onClick={() => onEditar(empresa)}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <DataTable
          columns={columnas}
          rows={empresasPaginados}
          loading={loading}
          emptyMessage="No existen empresas registradas."
          emptySearchMessage="No se encontraron empresas."
          hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'}
          getRowKey={(empresa) => empresa.id_empresa}
        />
      )}

      <Pagination
        total={totalRegistros}
        pagina={pagina}
        registrosPorPagina={registrosPorPagina}
        onPageChange={onChangePagina}
        onRowsPerPageChange={onChangeRegistrosPorPagina}
        opciones={[5, 10]}
      />

      <Dialog
        open={Boolean(empresaCambioEstado)}
        onClose={onCerrarConfirmacionEstado}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {empresaCambioEstado?.nuevoEstado ? 'Reactivar empresa' : 'Desactivar empresa'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {empresaCambioEstado?.nuevoEstado
              ? `¿Deseas reactivar "${empresaCambioEstado?.descripcion}"?`
              : `¿Deseas desactivar "${empresaCambioEstado?.descripcion}"? El registro se conservará en la base de datos.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={empresaCambioEstado?.nuevoEstado ? 'success' : 'warning'}
            onClick={onConfirmarCambioEstado}
            disabled={cambiandoEstado}
            startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {cambiandoEstado
              ? 'Guardando...'
              : empresaCambioEstado?.nuevoEstado ? 'Reactivar' : 'Desactivar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
