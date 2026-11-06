import { Add, Download as DownloadIcon } from '@mui/icons-material'
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material'
import PageHeader from '../common/PageHeader'
import SearchInput from '../common/SearchInput'

export default function EtapasCostoFilters({
  loading,
  totalRegistros,
  busqueda,
  filtroEstado,
  error,
  onExportar,
  onNuevaEtapa,
  onCambioBusqueda,
  onCambioEstado,
  onCerrarError,
}) {
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' },
          alignItems: 'center',
          gap: 1,
          '& > .MuiBox-root': { mb: 0 },
        }}
      >
        <PageHeader
          title="Etapas de Costo"
          description="Administración de etapas utilizadas para clasificar los costos de inversión."
        />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, width: { xs: '100%', sm: 'auto' }, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExportar}
            disabled={loading || totalRegistros === 0}
            sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
          >
            Exportar Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onNuevaEtapa}
            sx={{ borderRadius: 0.8, minHeight: 40, px: 2, textTransform: 'none', fontWeight: 600, width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
          >
            Nueva etapa
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: '100%', minWidth: 0, flex: '0 0 auto', display: 'flex', flexDirection: 'column',
          border: '1px solid', borderColor: 'divider', borderRadius: 1,
          overflow: 'hidden', backgroundColor: 'background.paper', marginBottom: 1,
        }}
      >
        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', backgroundColor: 'background.paper' }}>
          <Box sx={{ flex: '1 1 280px', minWidth: { xs: '100%', sm: 240 } }}>
            <SearchInput
              value={busqueda}
              onChange={onCambioBusqueda}
              placeholder="Buscar por código o etapa..."
              ariaLabel="Buscar etapa de costo"
              maxWidth="none"
            />
          </Box>
          <TextField
            select
            size="small"
            label="Estado"
            value={filtroEstado}
            onChange={(event) => onCambioEstado(event.target.value)}
            sx={{ width: { xs: '100%', sm: 190 }, flexShrink: 0 }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="activos">Activo</MenuItem>
            <MenuItem value="inactivos">Inactivo</MenuItem>
          </TextField>
          <Typography
            variant="body2"
            color="text.secondary"
            aria-live="polite"
            sx={{ ml: { xs: 'auto', sm: 0 }, whiteSpace: 'nowrap', fontWeight: 500 }}
          >
            <Box component="span" sx={{ color: 'primary.light', fontWeight: 700 }}>
              {totalRegistros}
            </Box>{' '}
            {totalRegistros === 1 ? 'registro encontrado' : 'registros encontrados'}
          </Typography>
        </Box>
        {error && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error" onClose={onCerrarError} sx={{ borderRadius: 1 }}>
              {error}
            </Alert>
          </Box>
        )}
      </Paper>
    </>
  )
}
