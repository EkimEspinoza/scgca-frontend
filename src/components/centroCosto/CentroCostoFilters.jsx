import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material'

import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'

function CentroCostoFilters({
  empresas,
  tiposCentroCosto,
  tiposMaquinaria,
  comparativos,
  variedades,

  tiposMaquinariaDisponibles,
  comparativosDisponibles,
  variedadesDisponibles,

  loadingMaestros,
  loadingOpciones,

  empresaId,
  estado,
  tipoCcId,
  tipoMaqId,
  comparativoId,
  variedadId,
  busqueda,

  mostrarTipoMaquinaria,
  mostrarComparativo,
  mostrarVariedad,

  onEmpresaChange,
  onEstadoChange,
  onTipoCcChange,
  onTipoMaqChange,
  onComparativoChange,
  onVariedadChange,
  onBusquedaChange,
  onLimpiarFiltros,
}) {
  /*
   * ==========================================
   * OPCIONES DISPONIBLES
   * ==========================================
   *
   * Filtramos los maestros utilizando los IDs
   * que realmente existen en dim_centro_costo.
   */

  const tiposMaquinariaFiltrados =
    tiposMaquinaria.filter((tipo) =>
      tiposMaquinariaDisponibles.includes(
        Number(tipo.id_tipo_maq),
      ),
    )

  const comparativosFiltrados =
    comparativos.filter((comparativo) =>
      comparativosDisponibles.includes(
        Number(comparativo.id_comparativo),
      ),
    )

  const variedadesFiltradas =
    variedades.filter((variedad) =>
      variedadesDisponibles.includes(
        Number(variedad.id_variedad),
      ),
    )

  /*
   * ==========================================
   * INDICADOR DE CARGA
   * ==========================================
   */
  const IndicadorCarga = () => {
    if (!loadingOpciones) {
      return null
    }

    return (
      <CircularProgress
        size={18}
        sx={{
          position: 'absolute',
          right: 35,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {/* ==================================
            EMPRESA
        =================================== */}
        <FormControl
          size="small"
          fullWidth
        >
          <InputLabel>
            Empresa
          </InputLabel>

          <Select
            value={empresaId}
            label="Empresa"
            onChange={onEmpresaChange}
            disabled={loadingMaestros}
          >
            <MenuItem value="">
              Todas las empresas
            </MenuItem>

            {empresas.map((empresa) => (
              <MenuItem
                key={empresa.id_empresa}
                value={empresa.id_empresa}
              >
                {empresa.nombre_comercial}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ==================================
            ESTADO
        =================================== */}
        <FormControl
          size="small"
          fullWidth
        >
          <InputLabel>
            Estado
          </InputLabel>

          <Select
            value={estado}
            label="Estado"
            onChange={onEstadoChange}
          >
            <MenuItem value="">
              Todos
            </MenuItem>

            <MenuItem value="true">
              Activo
            </MenuItem>

            <MenuItem value="false">
              Inactivo
            </MenuItem>
          </Select>
        </FormControl>

        {/* ==================================
            TIPO CENTRO DE COSTO
        =================================== */}
        <FormControl
          size="small"
          fullWidth
        >
          <InputLabel>
            Tipo de Centro de Costo
          </InputLabel>

          <Select
            value={tipoCcId}
            label="Tipo de Centro de Costo"
            onChange={onTipoCcChange}
            disabled={
              loadingMaestros ||
              loadingOpciones
            }
          >
            <MenuItem value="">
              Todos
            </MenuItem>

            {tiposCentroCosto.map((tipo) => (
              <MenuItem
                key={tipo.id_tip_cc}
                value={tipo.id_tip_cc}
              >
                {tipo.des_tip_cc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ==================================
            TIPO MAQUINARIA
        =================================== */}
        {mostrarTipoMaquinaria && (
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <FormControl
              size="small"
              fullWidth
            >
              <InputLabel>
                Tipo de Maquinaria
              </InputLabel>

              <Select
                value={tipoMaqId}
                label="Tipo de Maquinaria"
                onChange={onTipoMaqChange}
                disabled={
                  loadingOpciones
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>

                {tiposMaquinariaFiltrados.map(
                  (tipo) => (
                    <MenuItem
                      key={
                        tipo.id_tipo_maq
                      }
                      value={
                        tipo.id_tipo_maq
                      }
                    >
                      {
                        tipo.des_tipo_maquinaria
                      }
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <IndicadorCarga />
          </Box>
        )}

        {/* ==================================
            COMPARATIVO
        =================================== */}
        {mostrarComparativo && (
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <FormControl
              size="small"
              fullWidth
            >
              <InputLabel>
                Comparativo
              </InputLabel>

              <Select
                value={comparativoId}
                label="Comparativo"
                onChange={
                  onComparativoChange
                }
                disabled={
                  loadingOpciones
                }
              >
                <MenuItem value="">
                  Todos
                </MenuItem>

                {comparativosFiltrados.map(
                  (comparativo) => (
                    <MenuItem
                      key={
                        comparativo.id_comparativo
                      }
                      value={
                        comparativo.id_comparativo
                      }
                    >
                      {
                        comparativo.descripcion
                      }
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <IndicadorCarga />
          </Box>
        )}

        {/* ==================================
            VARIEDAD
        =================================== */}
        {mostrarVariedad && (
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <FormControl
              size="small"
              fullWidth
            >
              <InputLabel>
                Variedad
              </InputLabel>

              <Select
                value={variedadId}
                label="Variedad"
                onChange={
                  onVariedadChange
                }
                disabled={
                  loadingOpciones
                }
              >
                <MenuItem value="">
                  Todas
                </MenuItem>

                {variedadesFiltradas.map(
                  (variedad) => (
                    <MenuItem
                      key={
                        variedad.id_variedad
                      }
                      value={
                        variedad.id_variedad
                      }
                    >
                      {
                        variedad.descripcion
                      }
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <IndicadorCarga />
          </Box>
        )}

        {/* ==================================
            BUSCAR
        =================================== */}
        <TextField
          size="small"
          fullWidth
          label="Buscar"
          placeholder="Código o descripción"
          value={busqueda}
          onChange={onBusquedaChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{
                      color: 'text.secondary',
                    }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* ==================================
            LIMPIAR FILTROS
        =================================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={onLimpiarFiltros}
            fullWidth
          >
            Limpiar filtros
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default CentroCostoFilters