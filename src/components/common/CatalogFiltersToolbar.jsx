import { Add, CleaningServices, Download } from '@mui/icons-material'
import { Alert, Box, Button, IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import PageHeader from './PageHeader'
import SearchInput from './SearchInput'
import FiltersToolbar from './FiltersToolbar'

export default function CatalogFiltersToolbar({
  title, description, loading, totalRegistros, busqueda, filtroEstado, error,
  searchValue = busqueda, searchPlaceholder, searchLabel, createLabel, canCreate = true,
  onExportar, onCreate, onCambioBusqueda, onCambioEstado, onCerrarError, showInlineClear = false,
}) {
  const activeFilters = []
  if (busqueda?.trim()) activeFilters.push({ id: 'busqueda', label: `Búsqueda: ${busqueda}`, onRemove: () => onCambioBusqueda({ target: { value: '' } }) })
  if (filtroEstado && filtroEstado !== 'todos') {
    const stateLabel = { activos: 'Activo', inactivos: 'Inactivo' }[filtroEstado] ?? filtroEstado
    activeFilters.push({ id: 'estado', label: `Estado: ${stateLabel}`, onRemove: () => onCambioEstado('todos') })
  }

  const clear = activeFilters.length ? () => {
    if (busqueda?.trim()) onCambioBusqueda({ target: { value: '' } })
    if (filtroEstado && filtroEstado !== 'todos') onCambioEstado('todos')
  } : undefined

  return <>
    <PageHeader title={title} description={description} />
    <FiltersToolbar
      activeFilters={showInlineClear ? [] : activeFilters}
      onClear={showInlineClear ? undefined : clear}
      disabled={loading}
      actions={<>
        <Button className="app-excel-action-button" variant="outlined" color="inherit" startIcon={<Download />} onClick={onExportar} disabled={loading || totalRegistros === 0}>Exportar Excel</Button>
        {canCreate && <Button className="app-create-action-button" variant="contained" startIcon={<Add />} onClick={onCreate}>{createLabel}</Button>}
      </>}
    >
      <Box className="app-filters-row" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 280px', minWidth: { xs: '100%', sm: 240 } }}>
          <SearchInput value={searchValue} onChange={onCambioBusqueda} placeholder={searchPlaceholder} ariaLabel={searchLabel} maxWidth="none" />
        </Box>
        <TextField select size="small" label="Estado" value={filtroEstado} onChange={(event) => onCambioEstado(event.target.value)} sx={{ width: { xs: '100%', sm: 190 }, flexShrink: 0 }}>
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="activos">Activo</MenuItem>
          <MenuItem value="inactivos">Inactivo</MenuItem>
        </TextField>
        <Typography variant="body2" color="text.secondary" aria-live="polite" sx={{ ml: { xs: 'auto', sm: 0 }, whiteSpace: 'nowrap', fontWeight: 500 }}>
          <Box component="span" sx={{ color: 'primary.light', fontWeight: 700 }}>{totalRegistros}</Box>{' '}
          {totalRegistros === 1 ? 'registro encontrado' : 'registros encontrados'}
        </Typography>
        {showInlineClear && <Tooltip title="Limpiar filtros" arrow>
          <span>
            <IconButton className="app-clear-filters-icon" onClick={clear} disabled={loading || !clear} aria-label="Limpiar filtros de variedades">
              <CleaningServices fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>}
      </Box>
      {error && <Box sx={{ px: 2, pb: 2 }}><Alert severity="error" onClose={onCerrarError} sx={{ borderRadius: 1 }}>{error}</Alert></Box>}
    </FiltersToolbar>
  </>
}
