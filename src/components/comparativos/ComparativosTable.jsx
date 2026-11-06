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

export default function ComparativosTable({
  loading,
  comparativosPaginados,
  totalRegistros,
  busqueda,
  filtroEstado,
  pagina,
  registrosPorPagina,
  cambiandoEstado,
  comparativoCambioEstado,
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
      label: 'Comparativo',
      width: '60%',
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
      render: (comparativo) => (
        <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
            {comparativo.descripcion}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      width: '20%',
      render: (comparativo) => (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={comparativo.estado ? 'Desactivar comparativo' : 'Reactivar comparativo'}>
            <span>
              <Switch
                checked={Boolean(comparativo.estado)}
                onChange={() => onSolicitarCambioEstado(comparativo)}
                disabled={cambiandoEstado}
                size="small"
                inputProps={{ 'aria-label': `${comparativo.estado ? 'Desactivar' : 'Reactivar'} ${comparativo.descripcion}` }}
              />
            </span>
          </Tooltip>
          <StatusChip estado={comparativo.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
        </Box>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      width: '20%',
      align: 'center',
      render: (comparativo) => (
        <Tooltip title="Editar comparativo">
          <IconButton
            size="small"
            aria-label={`Editar ${comparativo.descripcion}`}
            onClick={() => onEditar(comparativo)}
            sx={{ p: 0.5, '&:hover': { backgroundColor: 'action.hover' } }}
          >
            <Edit fontSize="small" />
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
          aria-label="Lista de comparativos"
          sx={{ listStyle: 'none', m: 0, p: 0, flex: '0 1 auto', maxHeight: 420, overflowY: 'auto' }}
        >
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : comparativosPaginados.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ p: 3 }}>
              {Boolean(busqueda.trim()) || filtroEstado !== 'todos'
                ? 'No se encontraron comparativos.'
                : 'No existen comparativos registrados.'}
            </Typography>
          ) : comparativosPaginados.map((comparativo) => (
            <Box
              component="li"
              key={comparativo.id_comparativo}
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
                  {comparativo.descripcion}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                  <Tooltip title={comparativo.estado ? 'Desactivar comparativo' : 'Reactivar comparativo'}>
                    <span>
                      <Switch
                        checked={Boolean(comparativo.estado)}
                        onChange={() => onSolicitarCambioEstado(comparativo)}
                        disabled={cambiandoEstado}
                        size="small"
                        inputProps={{ 'aria-label': `${comparativo.estado ? 'Desactivar' : 'Reactivar'} ${comparativo.descripcion}` }}
                      />
                    </span>
                  </Tooltip>
                  <StatusChip estado={comparativo.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
                </Box>
              </Box>
              <IconButton
                aria-label={`Editar ${comparativo.descripcion}`}
                onClick={() => onEditar(comparativo)}
                sx={{ minWidth: 44, minHeight: 44 }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : (
        <DataTable
          columns={columnas}
          rows={comparativosPaginados}
          loading={loading}
          emptyMessage="No existen comparativos registrados."
          emptySearchMessage="No se encontraron comparativos para la búsqueda."
          hasSearch={Boolean(busqueda.trim()) || filtroEstado !== 'todos'}
          getRowKey={(comparativo) => comparativo.id_comparativo}
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
        open={Boolean(comparativoCambioEstado)}
        onClose={onCerrarConfirmacionEstado}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {comparativoCambioEstado?.nuevoEstado ? 'Reactivar comparativo' : 'Desactivar comparativo'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {comparativoCambioEstado?.nuevoEstado
              ? `¿Deseas reactivar "${comparativoCambioEstado?.descripcion}"?`
              : `¿Deseas desactivar "${comparativoCambioEstado?.descripcion}"? El registro se conservará en la base de datos.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrarConfirmacionEstado} disabled={cambiandoEstado}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={comparativoCambioEstado?.nuevoEstado ? 'success' : 'warning'}
            onClick={onConfirmarCambioEstado}
            disabled={cambiandoEstado}
            startIcon={cambiandoEstado ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {cambiandoEstado
              ? 'Guardando...'
              : comparativoCambioEstado?.nuevoEstado ? 'Reactivar' : 'Desactivar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
