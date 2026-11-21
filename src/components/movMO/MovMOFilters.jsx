import { useState } from 'react'
import { Autocomplete, Box, Button, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Popover, Select, TextField, Tooltip, Typography } from '@mui/material'
import { Add, CalendarMonth, CleaningServices, Refresh, Search, TableView, UploadFile } from '@mui/icons-material'
import SearchableSelect from '../common/SearchableSelect'

function monthLabel(value) {
  if (!value) return ''
  const [year, month] = value.slice(0, 7).split('-').map(Number)
  return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1))
}

function compactRangeLabel(desde, hasta) {
  if (!desde || !hasta) return 'Rango de fechas'
  const month = (value) => new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, 1)).replace('.', '')
  const yearDesde = desde.slice(0, 4)
  const yearHasta = hasta.slice(0, 4)
  return yearDesde === yearHasta ? `${month(desde)} – ${month(hasta)} ${yearHasta}` : `${month(desde)} ${yearDesde} – ${month(hasta)} ${yearHasta}`
}

function firstDayOfMonth(value) { return value ? `${value}-01` : '' }

function lastDayOfMonth(value) {
  if (!value) return ''
  const [year, month] = value.split('-').map(Number)
  return `${value}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`
}

export default function MovMOFilters({
  anio, onAnio, estado, onEstado, busquedaScire = '', onBusquedaScire, busquedaFinal = '', onBusquedaFinal, fechaDesde, onFechaDesde, fechaHasta, onFechaHasta, onLimpiar,
  tipoCentroId = '', onTipoCentro, tiposCentro = [], centroCostoPk = '', onCentroCosto, centrosCosto = [],
  grupoLaborId = '', onGrupoLabor, gruposLabor = [], opcionesCargando = false,
  mostrarImportar = false, mostrarExportar = false, exportando = false, totalExportable = 0, onExportar,
  mostrarNuevo = false, onNuevo,
  mostrarRevalidar = false, revalidando = false, onRevalidar,
  mostrarBusqueda = true, mostrarFiltrosCatalogo = true,
}) {
  const [rangoAnchor, setRangoAnchor] = useState(null)
  const rangoInvalido = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta)
  const anios = Array.from({ length: new Date().getFullYear() - 2017 + 1 }, (_, index) => String(new Date().getFullYear() - index))
  const labelRango = compactRangeLabel(fechaDesde, fechaHasta)
  const centrosDisponibles = tipoCentroId ? centrosCosto.filter((centro) => String(centro.id_tip_cc) === String(tipoCentroId)) : centrosCosto
  const centroSeleccionado = centrosDisponibles.find((centro) => String(centro.cod_cc_pk) === String(centroCostoPk)) ?? null
  const resumenEnUnaFila = !mostrarBusqueda && !mostrarFiltrosCatalogo
  return (
    <Box className={`app-filters-panel mov-mo-filters${resumenEnUnaFila ? ' mov-mo-filters--summary' : ''}`} sx={{ display: resumenEnUnaFila ? 'grid' : 'flex', flexDirection: resumenEnUnaFila ? undefined : 'column', gap: 1.5, p: 1.25, pt: 2.75, mb: 0, '& .MuiAutocomplete-input': { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } }}>
      <Box className="mov-mo-filters__row mov-mo-filters__row--catalog" sx={{ display: resumenEnUnaFila ? 'contents' : 'grid', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
        <SearchableSelect className="mov-mo-filter__year" label="Año" value={anio} options={anios.map((value) => ({ value, label: value }))} onChange={(event) => onAnio(event.target.value)} />
        {mostrarFiltrosCatalogo && <>
          <SearchableSelect className="mov-mo-filter__type" label="Tipo de centro de costo" value={tipoCentroId} options={[{ id_tip_cc: '', des_tip_cc: 'Todos' }, ...tiposCentro]} getOptionValue={(tipo) => tipo.id_tip_cc === '' ? '' : String(tipo.id_tip_cc)} getOptionLabel={(tipo) => tipo.des_tip_cc} onChange={(event) => onTipoCentro(event.target.value)} disabled={opcionesCargando} />
          <Autocomplete
            className="mov-mo-filter__center"
            size="small" options={centrosDisponibles} loading={opcionesCargando} value={centroSeleccionado}
            onChange={(_event, centro) => onCentroCosto(centro ? String(centro.cod_cc_pk) : '')}
            getOptionLabel={(centro) => `${centro.cod_cc ?? ''} · ${centro.desc_cc ?? ''}`.trim()}
            renderOption={(props, centro) => <Box component="li" {...props} title={`${centro.cod_cc ?? ''} · ${centro.desc_cc ?? ''}`} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{`${centro.cod_cc ?? ''} · ${centro.desc_cc ?? ''}`}</Box>}
            isOptionEqualToValue={(option, value) => Number(option.cod_cc_pk) === Number(value.cod_cc_pk)}
            sx={{ width: '100%', minWidth: 0, '& .MuiAutocomplete-input': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}
            renderInput={(params) => <TextField {...params} label="Centro de costo" placeholder={tipoCentroId ? 'Selecciona un centro' : 'Todos'} inputProps={{ ...params.inputProps, title: centroSeleccionado ? `${centroSeleccionado.cod_cc ?? ''} · ${centroSeleccionado.desc_cc ?? ''}` : undefined }} />}
          />
          <SearchableSelect className="mov-mo-filter__group" label="Grupo de labor" value={grupoLaborId} options={[{ Id_Grupo_Labor: '', DescripcionLabor: 'Todos' }, ...gruposLabor]} getOptionValue={(grupo) => grupo.Id_Grupo_Labor === '' ? '' : String(grupo.Id_Grupo_Labor)} getOptionLabel={(grupo) => grupo.DescripcionLabor} onChange={(event) => onGrupoLabor(event.target.value)} disabled={opcionesCargando} />
        </>}
      </Box>
      <Box className="mov-mo-filters__row mov-mo-filters__row--controls" sx={{ display: resumenEnUnaFila ? 'contents' : 'grid', alignItems: 'center', gap: 1, width: '100%', minWidth: 0 }}>
        {mostrarBusqueda && <>
          <TextField className="app-search-input mov-mo-filter__search mov-mo-filter__search-scire" size="small" label="Labor SCIRE" placeholder="Código o descripción SCIRE" value={busquedaScire} onChange={(event) => onBusquedaScire(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, endAdornment: <InputAdornment position="end"><Tooltip title="Limpiar Labor SCIRE"><span><IconButton size="small" onClick={() => onBusquedaScire('')} disabled={!busquedaScire} aria-label="Limpiar búsqueda de Labor SCIRE"><CleaningServices fontSize="small" /></IconButton></span></Tooltip></InputAdornment> } }} />
          <TextField className="app-search-input mov-mo-filter__search mov-mo-filter__search-final" size="small" label="Labor final" placeholder="Descripción de labor final" value={busquedaFinal} onChange={(event) => onBusquedaFinal(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, endAdornment: <InputAdornment position="end"><Tooltip title="Limpiar Labor final"><span><IconButton size="small" onClick={() => onBusquedaFinal('')} disabled={!busquedaFinal} aria-label="Limpiar búsqueda de Labor final"><CleaningServices fontSize="small" /></IconButton></span></Tooltip></InputAdornment> } }} />
        </>}
        <Tooltip title={fechaDesde && fechaHasta ? `${monthLabel(fechaDesde)} – ${monthLabel(fechaHasta)}` : 'Seleccionar rango de fechas'}>
          <Button className="tareo-filters-panel__dates mov-mo-filter__dates" variant="outlined" color="inherit" startIcon={<CalendarMonth sx={{ color: 'primary.main' }} />} onClick={(event) => setRangoAnchor(event.currentTarget)} aria-label={`Fechas: ${labelRango}`} aria-haspopup="dialog" aria-expanded={Boolean(rangoAnchor)} sx={{ minHeight: 40, justifyContent: 'flex-start', px: 1.5 }}>
            <Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, overflow: 'hidden' }}>
              <Typography component="span" variant="caption" color="text.secondary" lineHeight={1}>Fechas</Typography>
              <Typography component="span" variant="body2" noWrap>{labelRango}</Typography>
            </Box>
          </Button>
        </Tooltip>
        <FormControl className="mov-mo-filter__state" size="small"><InputLabel id="mov-mo-state-label">Estado</InputLabel><Select labelId="mov-mo-state-label" label="Estado" value={estado} onChange={(event) => onEstado(event.target.value)}><MenuItem value="">Todos</MenuItem><MenuItem value="1">Activo</MenuItem><MenuItem value="0">Inactivo</MenuItem></Select></FormControl>
        <Box className="mov-mo-filters__actions">
          {mostrarRevalidar && <Tooltip title="Vuelve a validar los pendientes de la empresa y el rango de fechas seleccionados"><span><Button variant="outlined" color="inherit" startIcon={<Refresh />} onClick={onRevalidar} disabled={revalidando || totalExportable === 0}>{revalidando ? 'Revalidando…' : 'Revalidar pendientes'}</Button></span></Tooltip>}
          {mostrarExportar && <Tooltip title={exportando ? 'Preparando archivo Excel…' : 'Exportar registros filtrados a Excel'}><span><Button className="app-excel-action-button" variant="outlined" color="inherit" startIcon={<TableView />} onClick={onExportar} disabled={exportando || totalExportable === 0}>{exportando ? 'Exportando…' : 'Exportar Excel'}</Button></span></Tooltip>}
          {mostrarNuevo && <Button variant="contained" color="success" startIcon={<Add />} onClick={onNuevo}>Nuevo registro</Button>}
          {mostrarImportar && <Tooltip title="La carga se habilitará al definir reglas de validación e identificación para los registros de Mano de Obra"><span><Button variant="outlined" color="inherit" startIcon={<UploadFile />} disabled>Cargar Excel</Button></span></Tooltip>}
          <Tooltip title="Limpiar filtros"><span><IconButton className="app-clear-filters-icon" color="primary" onClick={onLimpiar} aria-label="Limpiar filtros"><CleaningServices /></IconButton></span></Tooltip>
        </Box>
      </Box>
      {rangoInvalido && <Box sx={{ flexBasis: '100%', color: 'error.main', typography: 'caption' }}>El mes inicial no puede ser posterior al mes final.</Box>}
      <Popover open={Boolean(rangoAnchor)} anchorEl={rangoAnchor} onClose={() => setRangoAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        <Box role="dialog" aria-label="Seleccionar rango de meses" sx={{ width: { xs: 300, sm: 360 }, maxWidth: 'calc(100vw - 24px)', p: 1.5, '& .MuiInputBase-root, & .MuiInputBase-input, & .MuiInputLabel-root, & .MuiTypography-root': { fontSize: '0.75rem' } }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Selecciona el rango de meses</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
            <TextField size="small" label="Mes inicial" type="month" value={fechaDesde?.slice(0, 7) ?? ''} onChange={(event) => onFechaDesde(firstDayOfMonth(event.target.value))} error={rangoInvalido} slotProps={{ htmlInput: { min: '2017-01' }, inputLabel: { shrink: true } }} />
            <TextField size="small" label="Mes final" type="month" value={fechaHasta?.slice(0, 7) ?? ''} onChange={(event) => onFechaHasta(lastDayOfMonth(event.target.value))} error={rangoInvalido} slotProps={{ htmlInput: { min: '2017-01' }, inputLabel: { shrink: true } }} />
            {rangoInvalido && <Typography variant="caption" color="error.main" sx={{ gridColumn: '1 / -1' }}>El mes inicial no puede ser posterior al mes final.</Typography>}
          </Box>
        </Box>
      </Popover>
    </Box>
  )
}
