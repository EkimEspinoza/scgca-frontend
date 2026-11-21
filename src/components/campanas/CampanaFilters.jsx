import {
  Autocomplete,
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material'
import { CleaningServices as CleaningServicesIcon } from '@mui/icons-material'
import FiltersToolbar from '../common/FiltersToolbar'
import SearchableSelect from '../common/SearchableSelect'

function CampanaFilters({
  empresas,
  centrosCosto,
  empresaSeleccionada,
  tipoCentroCostoSeleccionado,
  centroCostoSeleccionado,
  estadoFiltro,
  cierreFiltro,
  busqueda = '',
  onEmpresaChange,
  onTipoCentroCostoChange,
  onCentroCostoChange,
  onEstadoChange,
  onCierreChange,
  onBusquedaChange,
  onLimpiarFiltros,
  loading = false,
}) {
  const tiposCentroCosto = Array.from(
    new Map(
      centrosCosto
        .filter((centro) => centro.tipo_centro_costo?.id_tip_cc && centro.tipo_centro_costo?.des_tip_cc)
        .map((centro) => [centro.tipo_centro_costo.id_tip_cc, centro.tipo_centro_costo]),
    ).values(),
  ).sort((a, b) => a.des_tip_cc.localeCompare(b.des_tip_cc, 'es', { sensitivity: 'base' }))
  const centrosCostoFiltrados = centrosCosto
    .filter((centro) => !tipoCentroCostoSeleccionado || String(centro.tipo_centro_costo?.id_tip_cc) === String(tipoCentroCostoSeleccionado))
    .sort((a, b) => (a.desc_cc ?? '').localeCompare(b.desc_cc ?? '', 'es', { sensitivity: 'base' }))

  return (
    <FiltersToolbar>
      <Box
        className="app-filters-row"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%', minWidth: 0, flexWrap: 'wrap' }}
      >
        <FormControl
          size="small"
          disabled={loading}
          sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 160px', lg: '0 1 180px' }, minWidth: { xs: 0, sm: 140, lg: 160 } }}
        >
          <InputLabel>Empresa</InputLabel>
          <Select value={empresaSeleccionada ?? ''} label="Empresa" onChange={onEmpresaChange}>
            <MenuItem value="">Todas las empresas</MenuItem>
            {empresas.map((empresa) => (
              <MenuItem key={empresa.id_empresa} value={empresa.id_empresa}>
                {empresa.nombre_comercial}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <SearchableSelect
          size="small"
          disabled={loading || !empresaSeleccionada}
          label="Tipo de Centro de Costo"
          value={tipoCentroCostoSeleccionado ?? ''}
          options={[{ id_tip_cc: '', des_tip_cc: 'Todos' }, ...tiposCentroCosto]}
          getOptionValue={(tipo) => tipo.id_tip_cc}
          getOptionLabel={(tipo) => tipo.des_tip_cc}
          onChange={onTipoCentroCostoChange}
          sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 190px', lg: '1.2 1 240px' }, minWidth: { xs: 0, sm: 180, lg: 220 } }}
        />

        <Autocomplete
          size="small"
          disabled={loading || !empresaSeleccionada}
          options={[
            { cod_cc_pk: '', cod_cc: '', desc_cc: 'Todos', esTodos: true },
            ...centrosCostoFiltrados,
          ]}
          value={
            centrosCostoFiltrados.find((centro) => String(centro.cod_cc_pk) === String(centroCostoSeleccionado))
            ?? { cod_cc_pk: '', cod_cc: '', desc_cc: 'Todos', esTodos: true }
          }
          getOptionLabel={(opcion) => opcion.esTodos ? 'Todos' : `${opcion.cod_cc} - ${opcion.desc_cc ?? ''}`}
          isOptionEqualToValue={(opcion, valor) => String(opcion.cod_cc_pk) === String(valor.cod_cc_pk)}
          onChange={(_event, opcion) => onCentroCostoChange({ target: { value: opcion?.esTodos ? '' : opcion?.cod_cc_pk ?? '' } })}
          sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 190px', lg: '1.4 1 240px' }, minWidth: { xs: 0, sm: 180, lg: 220 } }}
          renderInput={(params) => <TextField {...params} label="Centro de Costo" placeholder="Buscar centro de costo" />}
        />

        <TextField
          className="app-search-input"
          size="small"
          label="Buscar"
          placeholder="Campaña, empresa o centro de costo"
          value={busqueda}
          onChange={onBusquedaChange}
          disabled={loading}
          sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 190px', lg: '1.2 1 220px' }, minWidth: { xs: 0, sm: 180, lg: 200 } }}
        />

        <FormControl
          size="small"
          disabled={loading}
          sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 130px', lg: '0 1 130px' }, minWidth: { xs: 0, sm: 120, lg: 120 } }}
        >
          <InputLabel>Estado</InputLabel>
          <Select value={estadoFiltro ?? ''} label="Estado" onChange={onEstadoChange}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          size="small"
          disabled={loading}
          sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 130px', lg: '0 1 130px' }, minWidth: { xs: 0, sm: 120, lg: 120 } }}
        >
          <InputLabel>Cierre</InputLabel>
          <Select value={cierreFiltro ?? ''} label="Cierre" onChange={onCierreChange}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="false">Abierta</MenuItem>
            <MenuItem value="true">Cerrada</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Limpiar filtros" arrow>
          <span>
            <IconButton
              className="app-clear-filters-icon"
              onClick={onLimpiarFiltros}
              disabled={loading}
              size="small"
              color="primary"
              aria-label="Limpiar filtros"
              sx={{ width: 34, height: 34, flexShrink: 0, borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <CleaningServicesIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </FiltersToolbar>
  )
}

export default CampanaFilters
