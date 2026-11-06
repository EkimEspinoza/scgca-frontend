import { Edit as EditIcon } from '@mui/icons-material'
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

export default function EtapasCostoTable({
  loading,
  etapasPaginadas,
  totalRegistros,
  busqueda,
  filtroEstado,
  pagina,
  registrosPorPagina,
  cambiandoEstado,
  etapaCambioEstado,
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
      key: 'etapa_costo',
      label: 'Etapa de Costo',
      width: '55%',
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
      render: (etapa) => (
        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
            {etapa.etapa_costo}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      width: '15%',
      render: (etapa) => (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={etapa.estado ? 'Desactivar etapa de costo' : 'Reactivar etapa de costo'}>
            <span>
              <Switch
                checked={Boolean(etapa.estado)}
                onChange={() => onSolicitarCambioEstado(etapa)}
                disabled={cambiandoEstado}
                size="small"
                inputProps={{ 'aria-label': `${etapa.estado ? 'Desactivar' : 'Reactivar'} etapa ${etapa.cod_etapa}` }}
              />
            </span>
          </Tooltip>
          <StatusChip estado={etapa.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
        </Box>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      width: '15%',
      align: 'center',
      render: (etapa) => (
        <Tooltip title="Editar etapa de costo">
          <IconButton
            size="small"
            onClick={() => onEditar(etapa)}
            aria-label={`Editar etapa ${etapa.cod_etapa}`}
            sx={{ p: 0.5, '&:hover': { backgroundColor: 'action.hover' } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        minWidth: 0,
        minHeight: 0,
        flex: esVistaMovil ? '0 0 auto' : 1,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
      }}
    >
      {esVistaMovil ? (
        <Box
          component="ul"
          aria-label="Lista de etapas de costo"
          sx={{ listStyle: 'none', m: 0, p: 0, flex: '0 1 auto', maxHeight: 420, overflowY: 'auto' }}
        >
          {loading ? (
            <Box component="li" sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : etapasPaginadas.length === 0 ? (
            <Box component="li" sx={{ p: 3 }}>
              <Typography color="text.secondary" align="center">
                {Boolean(busqueda.trim()) || filtroEstado !== 'todos'
                  ? 'No se encontraron etapas de costo.'
                  : 'No existen etapas de costo registradas.'}
              </Typography>
            </Box>
          ) : etapasPaginadas.map((etapa) => (
            <Box
              component="li"
              key={etapa.cod_etapa}
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
                  {etapa.etapa_costo}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  Código: {etapa.cod_etapa}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                  <Tooltip title={etapa.estado ? 'Desactivar etapa de costo' : 'Reactivar etapa de costo'}>
                    <span>
                      <Switch
                        checked={Boolean(etapa.estado)}
                        onChange={() => onSolicitarCambioEstado(etapa)}
                        disabled={cambiandoEstado}
                        size="small"
                        inputProps={{ 'aria-label': `${etapa.estado ? 'Desactivar' : 'Reactivar'} etapa ${etapa.cod_etapa}` }}
                      />
                    </span>
                  </Tooltip>
                  <StatusChip estado={etapa.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                </Box>
              </Box>
              <IconButton
                aria-label={`Editar etapa ${etapa.cod_etapa}`}
                onClick={() => onEditar(etapa)}
                sx={{ minWidth: 44, minHeight: 44 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : (
        <DataTable
          columns={columnas}
          rows={etapasPaginadas}
          loading={loading}
          emptyMessage="No existen etapas de costo registradas."
          emptySearchMessage="No se encontraron etapas de costo."
          hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'}
          getRowKey={(etapa) => etapa.cod_etapa}
        />
      )}

      <Pagination
        total={totalRegistros}
        pagina={pagina}
        registrosPorPagina={registrosPorPagina}
        onPageChange={onChangePagina}
        onRowsPerPageChange={onChangeRegistrosPorPagina}
      />

      <Dialog
        open={Boolean(etapaCambioEstado)}
        onClose={onCerrarConfirmacionEstado}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {etapaCambioEstado?.nuevoEstado ? 'Reactivar etapa de costo' : 'Desactivar etapa de costo'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {etapaCambioEstado?.nuevoEstado
              ? `¿Deseas reactivar "${etapaCambioEstado?.etapa_costo}"?`
              : `¿Deseas desactivar "${etapaCambioEstado?.etapa_costo}"? El registro se conservará en la base de datos.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={etapaCambioEstado?.nuevoEstado ? 'success' : 'warning'}
            onClick={onConfirmarCambioEstado}
            disabled={cambiandoEstado}
            startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {cambiandoEstado
              ? 'Guardando...'
              : etapaCambioEstado?.nuevoEstado ? 'Reactivar' : 'Desactivar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
