import { useState } from 'react'
import {
  Autocomplete, Box, Button, Collapse, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Paper, Popover, Select, TextField, Tooltip, Typography, useMediaQuery,
} from '@mui/material'
import { CalendarMonth, Clear as ClearIcon, CleaningServices as CleaningServicesIcon, FilterList as FilterIcon, Search as SearchIcon, TableView, UploadFile as UploadIcon } from '@mui/icons-material'

function dateLabel(value) {
  if (!value) return ''
  const [year, month] = value.slice(0, 7).split('-').map(Number)
  return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1))
}

function compactRangeLabel(desde, hasta) {
  if (!desde || !hasta) return 'Rango de fechas'
  const month = (value) => new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, 1)).replace('.', '')
  const yearDesde = desde.slice(0, 4)
  const yearHasta = hasta.slice(0, 4)
  return yearDesde === yearHasta
    ? `${month(desde)} – ${month(hasta)} ${yearHasta}`
    : `${month(desde)} ${yearDesde} – ${month(hasta)} ${yearHasta}`
}

function firstDayOfMonth(value) {
  return value ? `${value}-01` : ''
}

function lastDayOfMonth(value) {
  if (!value) return ''
  const [year, month] = value.split('-').map(Number)
  const day = new Date(year, month, 0).getDate()
  return `${value}-${String(day).padStart(2, '0')}`
}

export default function TareoFilters({ busqueda, onBusqueda, estado, onEstadoChange, fechaDesde, onFechaDesde, fechaHasta, onFechaHasta, anio, onAnioChange, onCargarArchivo, puedeCargar = true, mostrarCarga = true, modoResumen = false, centroCostoFiltro = '', onCentroCostoFiltro, opcionesCentroCosto = [], maquinariaFiltro = '', onMaquinariaFiltro, opcionesMaquinaria = [], opcionesCargando = false, onExportar, exportando = false, totalExportable = 0 }) {
  const mobile = useMediaQuery('(max-width: 767.95px)')
  const [abiertos, setAbiertos] = useState(false)
  const [rangoAnchor, setRangoAnchor] = useState(null)

  const anioActual = String(new Date().getFullYear())
  const rangoInvalido = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta)
  const rangoCompletoAnio = fechaDesde === `${anio}-01-01` && fechaHasta === `${anio}-12-31`
  const rangoPersonalizado = Boolean(fechaDesde || fechaHasta) && !rangoCompletoAnio
  const centroSeleccionado = opcionesCentroCosto.find((opcion) => opcion.value === centroCostoFiltro) ?? null
  const maquinariaSeleccionada = opcionesMaquinaria.find((opcion) => opcion.value === maquinariaFiltro) ?? null
  const filtrosActivos = []

  if (busqueda?.trim()) filtrosActivos.push({ id: 'busqueda', label: `Búsqueda: ${busqueda}`, onRemove: () => onBusqueda('') })
  if (estado !== '') filtrosActivos.push({ id: 'estado', label: `Estado: ${estado === '1' ? 'Activo' : 'Inactivo'}`, onRemove: () => onEstadoChange('') })
  if (centroCostoFiltro) filtrosActivos.push({ id: 'centro', label: centroSeleccionado?.desc_cc || centroSeleccionado?.cod_cc || 'Centro de costo', onRemove: () => onCentroCostoFiltro('') })
  if (maquinariaFiltro) filtrosActivos.push({ id: 'maquinaria', label: maquinariaSeleccionada?.desc_cc || maquinariaSeleccionada?.cod_cc || 'Maquinaria', onRemove: () => onMaquinariaFiltro('') })
  if (rangoPersonalizado) {
    filtrosActivos.push({
      id: 'fechas',
      label: `Fechas: ${fechaDesde ? dateLabel(fechaDesde) : 'inicio'} – ${fechaHasta ? dateLabel(fechaHasta) : 'fin'}`,
      onRemove: () => onAnioChange(anio || anioActual),
    })
  } else if (anio !== anioActual) {
    filtrosActivos.push({ id: 'anio', label: `Año: ${anio}`, onRemove: () => onAnioChange(anioActual) })
  }

  const limpiar = () => { onBusqueda(''); onEstadoChange(''); onCentroCostoFiltro(''); onMaquinariaFiltro(''); onAnioChange(anioActual) }
  const labelRango = compactRangeLabel(fechaDesde, fechaHasta)

  return (
    <Paper className={`tareo-filters-panel app-filters-panel${modoResumen ? ' tareo-filters-panel--summary' : ''}`} elevation={0}>
      {mobile && <Button size="small" color="inherit" startIcon={<FilterIcon />} onClick={() => setAbiertos((value) => !value)} aria-expanded={abiertos} sx={{ mb: 0.5 }}>Filtros {filtrosActivos.length ? `(${filtrosActivos.length})` : ''}</Button>}
      <Collapse in={!mobile || abiertos}>
        <Box className="tareo-filters-panel__layout">
          <Box className="tareo-filters-panel__controls">
            <Box className="tareo-filters-panel__row tareo-filters-panel__row--primary">
            <FormControl className="tareo-filters-panel__year" size="small">
              <InputLabel id="tareo-year-label">Año</InputLabel>
              <Select labelId="tareo-year-label" label="Año" value={anio} onChange={(event) => onAnioChange(event.target.value)} inputProps={{ 'aria-label': 'Filtrar por año' }}>
                {Array.from({ length: new Date().getFullYear() - 2017 + 1 }, (_, index) => new Date().getFullYear() - index).map((year) => <MenuItem key={year} value={String(year)}>{year}</MenuItem>)}
              </Select>
            </FormControl>
            {!modoResumen && <Autocomplete
              className="tareo-filters-panel__center"
              size="small"
              options={opcionesCentroCosto}
              value={centroSeleccionado}
              loading={opcionesCargando}
              onChange={(_event, value) => onCentroCostoFiltro(value?.value ?? '')}
              getOptionLabel={(option) => `${option.cod_cc ?? ''} · ${option.desc_cc ?? ''}`.trim()}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderOption={(props, option) => <Box component="li" {...props} title={`${option.cod_cc ?? ''} · ${option.desc_cc ?? ''}`} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{`${option.cod_cc ?? ''} · ${option.desc_cc ?? ''}`}</Box>}
              renderInput={(params) => <TextField {...params} label="Centro de costo" placeholder="Todos" inputProps={{ ...params.inputProps, title: centroSeleccionado ? `${centroSeleccionado.cod_cc ?? ''} · ${centroSeleccionado.desc_cc ?? ''}` : undefined }} />}
            />}
            {!modoResumen && <Autocomplete
              className="tareo-filters-panel__machinery"
              size="small"
              options={opcionesMaquinaria}
              value={maquinariaSeleccionada}
              loading={opcionesCargando}
              onChange={(_event, value) => onMaquinariaFiltro(value?.value ?? '')}
              getOptionLabel={(option) => `${option.cod_cc ?? ''} · ${option.desc_cc ?? ''}`.trim()}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              renderOption={(props, option) => <Box component="li" {...props} title={`${option.cod_cc ?? ''} · ${option.desc_cc ?? ''}`} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{`${option.cod_cc ?? ''} · ${option.desc_cc ?? ''}`}</Box>}
              renderInput={(params) => <TextField {...params} label="Maquinaria" placeholder="Todas" inputProps={{ ...params.inputProps, title: maquinariaSeleccionada ? `${maquinariaSeleccionada.cod_cc ?? ''} · ${maquinariaSeleccionada.desc_cc ?? ''}` : undefined }} />}
            />}
            </Box>
            <Box className="tareo-filters-panel__row tareo-filters-panel__row--secondary">
            {!modoResumen && <TextField
              className="app-search-input tareo-filters-panel__search"
              size="small"
              label="Buscar"
              placeholder="Número de parte"
              value={busqueda}
              onChange={(event) => onBusqueda(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={busqueda ? 'Limpiar búsqueda' : 'No hay búsqueda para limpiar'}>
                        <span>
                          <IconButton size="small" edge="end" aria-label="Limpiar búsqueda" onClick={() => onBusqueda('')} disabled={!busqueda}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
            />}
            <Tooltip title={fechaDesde && fechaHasta ? `${dateLabel(fechaDesde)} – ${dateLabel(fechaHasta)}` : 'Seleccionar rango de fechas'}>
              <Button className="tareo-filters-panel__dates" variant="outlined" color="inherit" startIcon={<CalendarMonth sx={{ color: 'primary.main' }} />} onClick={(event) => setRangoAnchor(event.currentTarget)} aria-label={`Fechas: ${labelRango}`} aria-haspopup="dialog" aria-expanded={Boolean(rangoAnchor)}>
                <Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, overflow: 'hidden' }}>
                  <Typography component="span" variant="caption" color="text.secondary" lineHeight={1}>Fechas</Typography>
                  <Typography component="span" variant="body2" noWrap>{labelRango}</Typography>
                </Box>
              </Button>
            </Tooltip>
            {!modoResumen && <FormControl className="tareo-filters-panel__state" size="small">
              <InputLabel id="tareo-state-label">Estado</InputLabel>
              <Select labelId="tareo-state-label" label="Estado" value={estado} onChange={(event) => onEstadoChange(event.target.value)} inputProps={{ 'aria-label': 'Filtrar por estado' }}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="1">Activo</MenuItem>
                <MenuItem value="0">Inactivo</MenuItem>
              </Select>
            </FormControl>}
            {!modoResumen && <Tooltip title="Limpiar filtros" arrow>
              <span>
                <IconButton className="app-clear-filters-icon" onClick={limpiar} disabled={!filtrosActivos.length} size="small" color="primary" aria-label="Limpiar filtros">
                  <CleaningServicesIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>}
            {(mostrarCarga || onExportar) && <Box className="tareo-filters-panel__actions">
              {onExportar && <Tooltip title="Exportar los registros filtrados a Excel"><span><Button className="app-excel-action-button" variant="outlined" color="inherit" startIcon={<TableView />} onClick={onExportar} disabled={exportando || totalExportable === 0}>{exportando ? 'Exportando…' : 'Exportar Excel'}</Button></span></Tooltip>}
              {mostrarCarga && <Tooltip title={puedeCargar ? 'Importar y validar archivo Excel' : 'Solo ADMIN puede importar datos de Tareo'}>
                <Button className="tareo-filters-panel__upload app-excel-action-button" variant="outlined" color="inherit" component="label" startIcon={<UploadIcon />} aria-label="Cargar archivo Excel" disabled={!puedeCargar}>
                  Cargar Excel
                  <input hidden type="file" accept=".xlsx,.xls" disabled={!puedeCargar} onChange={(event) => { const file = event.target.files?.[0]; if (file) onCargarArchivo(file); event.target.value = '' }} />
                </Button>
              </Tooltip>}
            </Box>}
            </Box>
          </Box>
        </Box>
      </Collapse>

      <Popover open={Boolean(rangoAnchor)} anchorEl={rangoAnchor} onClose={() => setRangoAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        <Box role="dialog" aria-label="Seleccionar rango de meses" sx={{ width: { xs: 300, sm: 360 }, maxWidth: 'calc(100vw - 24px)', p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Selecciona el rango de meses</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
            <TextField size="small" label="Mes inicial" type="month" value={fechaDesde?.slice(0, 7) ?? ''} onChange={(event) => onFechaDesde(firstDayOfMonth(event.target.value))} error={rangoInvalido} slotProps={{ htmlInput: { min: '2017-01' }, inputLabel: { shrink: true } }} />
            <TextField size="small" label="Mes final" type="month" value={fechaHasta?.slice(0, 7) ?? ''} onChange={(event) => onFechaHasta(lastDayOfMonth(event.target.value))} error={rangoInvalido} slotProps={{ htmlInput: { min: '2017-01' }, inputLabel: { shrink: true } }} />
            {rangoInvalido && <Typography variant="caption" color="error.main" sx={{ gridColumn: '1 / -1' }}>El mes inicial no puede ser posterior al mes final.</Typography>}
          </Box>
        </Box>
      </Popover>
    </Paper>
  )
}
