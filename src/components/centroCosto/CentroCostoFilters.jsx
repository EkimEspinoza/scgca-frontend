// Presenta los filtros de CentroCosto.
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material'
import { Search as SearchIcon, CleaningServices as CleaningServicesIcon } from '@mui/icons-material'
import FiltersToolbar from '../common/FiltersToolbar'
import SearchableSelect from '../common/SearchableSelect'

function CentroCostoFilters({
  tiposCentroCosto,
  tiposMaquinaria,
  comparativos,
  variedades,
  tiposMaquinariaDisponibles,
  comparativosDisponibles,
  variedadesDisponibles,
  loadingMaestros,
  loadingOpciones,
  estado,
  tipoCcId,
  tipoMaqId,
  comparativoId,
  variedadId,
  busqueda,
  mostrarTipoMaquinaria,
  mostrarComparativo,
  mostrarVariedad,
  onEstadoChange,
  onTipoCcChange,
  onTipoMaqChange,
  onComparativoChange,
  onVariedadChange,
  onBusquedaChange,
  onLimpiarFiltros,
}) {
  // Filtra las opciones dependientes disponibles para los centros actuales.
  const filtrarOpciones = (opciones = [], disponibles = []) => {
    if (!disponibles || disponibles.length === 0) return opciones

    const idsDisponibles = new Set(disponibles.map((item) => Number(item)))
    return opciones.filter((item) => idsDisponibles.has(Number(item.id_tipo_maq ?? item.id_comparativo ?? item.id_variedad)))
  }

  const tiposMaquinariaFiltrados = filtrarOpciones(tiposMaquinaria, tiposMaquinariaDisponibles)
  const comparativosFiltrados = filtrarOpciones(comparativos, comparativosDisponibles)
  const variedadesFiltradas = filtrarOpciones(variedades, variedadesDisponibles)
  const cargando = loadingMaestros || loadingOpciones

  return (
    <FiltersToolbar>
      {/* Los filtros se distribuyen en una fila y se acomodan en pantallas pequeñas. */}
      <Box
        className="app-filters-row"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          width: '100%',
          minWidth: 0,
          flexWrap: { xs: 'wrap', xl: 'nowrap' },
        }}
      >
        <SearchableSelect
          size="small"
          disabled={cargando}
          label="Tipo de Centro de Costo"
          value={tipoCcId ?? ''}
          options={[{ id_tip_cc: '', des_tip_cc: 'Todos' }, ...tiposCentroCosto]}
          getOptionValue={(tipo) => tipo.id_tip_cc}
          getOptionLabel={(tipo) => tipo.des_tip_cc}
          onChange={onTipoCcChange}
          sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 240px', lg: '1.4 1 240px' }, minWidth: { xs: 0, sm: 220, lg: 220 } }}
        />

        {/* Tipo de maquinaria se habilita según el tipo de centro de costo. */}
        {mostrarTipoMaquinaria && (
          <SearchableSelect
            size="small"
            disabled={cargando || !tipoCcId}
            label="Tipo de Maquinaria"
            value={tipoMaqId ?? ''}
            options={[{ id_tipo_maq: '', des_tipo_maquinaria: 'Todos' }, ...tiposMaquinariaFiltrados]}
            getOptionValue={(tipo) => tipo.id_tipo_maq}
            getOptionLabel={(tipo) => tipo.des_tipo_maquinaria}
            onChange={onTipoMaqChange}
            sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 180px' }, minWidth: { xs: 0, sm: 160 } }}
          />
        )}

        {/* Comparativo se habilita según el tipo de centro de costo. */}
        {mostrarComparativo && (
          <SearchableSelect
            size="small"
            disabled={cargando || !tipoCcId}
            label="Comparativo"
            value={comparativoId ?? ''}
            options={[{ id_comparativo: '', descripcion: 'Todos' }, ...comparativosFiltrados]}
            getOptionValue={(item) => item.id_comparativo}
            getOptionLabel={(item) => item.descripcion}
            onChange={onComparativoChange}
            sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 170px' }, minWidth: { xs: 0, sm: 140 } }}
          />
        )}

        {/* Variedad se habilita según el tipo de centro de costo. */}
        {mostrarVariedad && (
          <SearchableSelect
            size="small"
            disabled={cargando || !tipoCcId}
            label="Variedad"
            value={variedadId ?? ''}
            options={[{ id_variedad: '', descripcion: 'Todas' }, ...variedadesFiltradas]}
            getOptionValue={(item) => item.id_variedad}
            getOptionLabel={(item) => item.descripcion}
            onChange={onVariedadChange}
            sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 170px' }, minWidth: { xs: 0, sm: 140 } }}
          />
        )}

        <TextField
          className="app-search-input"
          size="small"
          label="Buscar"
          placeholder="Código o descripción"
          value={busqueda ?? ''}
          onChange={onBusquedaChange}
          disabled={cargando}
          sx={{
            flex: { xs: '2 1 calc(50% - 8px)', sm: '1 1 220px', lg: '1.3 1 220px' },
            minWidth: { xs: 0, sm: 200, lg: 200 },
            '& .MuiInputBase-root': { backgroundColor: 'background.paper' },
          }}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
            },
          }}
        />

        <FormControl
          size="small"
          disabled={cargando}
          sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 130px', lg: '0 1 130px' }, minWidth: { xs: 0, sm: 120, lg: 120 } }}
        >
          <InputLabel>Estado</InputLabel>
          <Select value={estado ?? ''} label="Estado" onChange={onEstadoChange}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ACTIVO">Activo</MenuItem>
            <MenuItem value="INACTIVO">Inactivo</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Limpiar filtros" arrow>
          <span>
            <IconButton
              className="app-clear-filters-icon"
              onClick={onLimpiarFiltros}
              disabled={cargando}
              size="small"
              color="primary"
              aria-label="Limpiar filtros"
              sx={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: 1,
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <CleaningServicesIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </FiltersToolbar>
  )
}

export default CentroCostoFilters
