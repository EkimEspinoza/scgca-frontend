import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
} from '@mui/material'

import {
  CleaningServices as CleaningServicesIcon,
  Search as SearchIcon,
} from '@mui/icons-material'

function UsuariosFilters({
  filtros,
  permisos = [],
  empresas = [],
  loading = false,
  onFiltroChange,
  onLimpiarFiltros,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: '100%',
        p: 1.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        boxSizing: 'border-box',
      }}
    >
      <Box
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
        <FormControl
          size="small"
          sx={{
            width: {
              xs: '100%',
              sm: 180,
            },
            flexShrink: 0,
          }}
          disabled={loading}
        >
          <InputLabel>
            Permiso
          </InputLabel>

          <Select
            value={filtros.permiso}
            label="Permiso"
            onChange={(event) =>
              onFiltroChange(
                'permiso',
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

            {permisos.map(
              (permiso) => (
                <MenuItem
                  key={
                    permiso.id_permiso
                  }
                  value={
                    permiso.id_permiso
                  }
                >
                  {permiso.nombre}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        {/* Empresa */}
        <FormControl
          size="small"
          sx={{
            width: {
              xs: '100%',
              sm: 190,
            },
            flexShrink: 0,
          }}
          disabled={loading}
        >
          <InputLabel>
            Empresa
          </InputLabel>

          <Select
            value={filtros.empresa}
            label="Empresa"
            onChange={(event) =>
              onFiltroChange(
                'empresa',
                event.target.value,
              )
            }
            sx={{
              borderRadius: 1,
            }}
          >
            <MenuItem value="">
              Todas
            </MenuItem>

            {empresas.map(
              (empresa) => (
                <MenuItem
                  key={
                    empresa.id_empresa
                  }
                  value={
                    empresa.id_empresa
                  }
                >
                  {
                    empresa.nombre_comercial
                  }
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        {/* Buscar */}
        <TextField
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
              onClick={
                onLimpiarFiltros
              }
              disabled={loading}
              color="primary"
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
    </Paper>
  )
}

export default UsuariosFilters