// Presenta los filtros de Usuarios.
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material'

import {
  CleaningServices as CleaningServicesIcon,
  Search as SearchIcon,
} from '@mui/icons-material'

import { obtenerEtiquetaPermiso } from './usuarioRules'
import FiltersToolbar from '../common/FiltersToolbar'
import SearchableSelect from '../common/SearchableSelect'

function UsuariosFilters({
  filtros,
  permisos = [],
  loading = false,
  onFiltroChange,
  onLimpiarFiltros,
  actions,
}) {
  const activeFilters = []
  const permiso = permisos.find((item) => String(item.id_permiso) === String(filtros.permiso))
  if (filtros.estado) activeFilters.push({ id: 'estado', label: `Estado: ${{ ACTIVO: 'Activo', PENDIENTE: 'Pendiente', INACTIVO: 'Inactivo' }[filtros.estado] ?? filtros.estado}`, onRemove: () => onFiltroChange('estado', '') })
  if (filtros.permiso) activeFilters.push({ id: 'permiso', label: `Permiso: ${permiso ? obtenerEtiquetaPermiso(permiso.nombre) : filtros.permiso}`, onRemove: () => onFiltroChange('permiso', '') })
  if (filtros.buscar?.trim()) activeFilters.push({ id: 'buscar', label: `Búsqueda: ${filtros.buscar}`, onRemove: () => onFiltroChange('buscar', '') })

  return (
    <FiltersToolbar className="usuarios-filters" actions={actions} activeFilters={activeFilters} onClear={activeFilters.length ? onLimpiarFiltros : undefined} disabled={loading}>
      <Box
        className="app-filters-row"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          width: '100%',
          minWidth: 0,
          flexWrap: {
            xs: 'wrap',
            lg: 'nowrap',
          },
        }}
      >
        {/* Estado */}
        <FormControl
          size="small"
          sx={{
            width: {
              xs: '100%',
              sm: 140,
            },
            flexShrink: 0,
          }}
          disabled={loading}
        >
          <InputLabel>
            Estado
          </InputLabel>

          <Select
            value={filtros.estado}
            label="Estado"
            onChange={(event) =>
              onFiltroChange(
                'estado',
                event.target.value,
              )
            }
            sx={{
              borderRadius: 1,
            }}
          >
            <MenuItem value="">
              Todos
            </MenuItem>

            <MenuItem value="ACTIVO">
              Activo
            </MenuItem>

            <MenuItem value="PENDIENTE">
              Pendiente
            </MenuItem>

            <MenuItem value="INACTIVO">
              Inactivo
            </MenuItem>
          </Select>
        </FormControl>

        {/* Permiso */}
        <SearchableSelect
          size="small"
          sx={{
            width: {
              xs: '100%',
              sm: 180,
            },
            flexShrink: 0,
          }}
          label="Permiso"
          value={filtros.permiso}
          options={[{ id_permiso: '', nombre: 'Todos' }, ...permisos]}
          getOptionValue={(permiso) => permiso.id_permiso}
          getOptionLabel={(permiso) => permiso.id_permiso === '' ? 'Todos' : obtenerEtiquetaPermiso(permiso.nombre)}
          onChange={(event) => onFiltroChange('permiso', event.target.value)}
          disabled={loading}
        />

        {/* Buscar */}
        <TextField
          className="app-search-input"
          size="small"
          label="Buscar"
          placeholder="Nombre o permiso"
          value={filtros.buscar}
          onChange={(event) =>
            onFiltroChange(
              'buscar',
              event.target.value,
            )
          }
          disabled={loading}
          sx={{
            flex: '1 1 220px',
            minWidth: {
              xs: '100%',
              lg: 180,
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon
                    fontSize="small"
                    color="action"
                  />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Limpiar */}
        <Tooltip title="Limpiar filtros">
          <span>
            <IconButton
              className="app-clear-filters-icon"
              onClick={
                onLimpiarFiltros
              }
              disabled={loading}
              color="primary"
              aria-label="Limpiar filtros"
              sx={{
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 1,
              }}
            >
              <CleaningServicesIcon
                fontSize="small"
              />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </FiltersToolbar>
  )
}

export default UsuariosFilters
