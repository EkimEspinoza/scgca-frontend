import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
} from '@mui/material'
import {
  Search as SearchIcon,
  CleaningServices as CleaningServicesIcon,
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
   * =========================================================
   * FILTRAR OPCIONES DEPENDIENTES
   * =========================================================
   */
  const filtrarOpciones = (
    opciones = [],
    disponibles = [],
  ) => {
    if (
      !disponibles ||
      disponibles.length === 0
    ) {
      return opciones
    }
    const idsDisponibles =
      new Set(
        disponibles.map(
          (item) => Number(item),
        ),
      )
    return opciones.filter(
      (item) =>
        idsDisponibles.has(
          Number(
            item.id_tipo_maq ??
            item.id_comparativo ??
            item.id_variedad,
          ),
        ),
    )
  }
  /*
   * =========================================================
   * OPCIONES FILTRADAS
   * =========================================================
   */
  const tiposMaquinariaFiltrados =
    filtrarOpciones(
      tiposMaquinaria,
      tiposMaquinariaDisponibles,
    )
  const comparativosFiltrados =
    filtrarOpciones(
      comparativos,
      comparativosDisponibles,
    )
  const variedadesFiltradas =
    filtrarOpciones(
      variedades,
      variedadesDisponibles,
    )
  /*
   * =========================================================
   * ESTADO DE CARGA
   * =========================================================
   */
  const cargando =
    loadingMaestros ||
    loadingOpciones
  /*
   * =========================================================
   * RENDER
   * =========================================================
   */
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: '100%',
        p: { xs: 0.75, sm: 1 },
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor:
          'background.paper',
        boxSizing: 'border-box',
        '& .MuiInputBase-root': { fontSize: '0.75rem', minHeight: 36 },
        '& .MuiInputLabel-root': { fontSize: '0.75rem' },
        '& .MuiMenuItem-root': { fontSize: '0.75rem' },
        overflow: 'hidden',
      }}
    >
      {/* =====================================================
          FILA PRINCIPAL DE FILTROS
      ====================================================== */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          width: '100%',
          minWidth: 0,
          /*
           * En escritorio:
           * todos los filtros permanecen en una sola fila.
           *
           * En pantallas pequeñas:
           * pueden distribuirse en varias filas.
           */
          flexWrap: {
            xs: 'wrap',
            xl: 'nowrap',
          },
        }}
      >
        {/* =================================================
            EMPRESA
        ================================================== */}
        <FormControl
          size="small"
          disabled={cargando}
          sx={{
            flex: {
              xs: '1 1 calc(50% - 8px)',
              sm: '1 1 180px',
              lg: '0 1 180px',
            },
            minWidth: {
              xs: 0,
              sm: 160,
              lg: 160,
            },
          }}
        >
          <InputLabel>
            Empresa
          </InputLabel>
          <Select
            value={
              empresaId ?? ''
            }
            label="Empresa"
            onChange={
              onEmpresaChange
            }
          >
            <MenuItem value="">
              Todas las empresas
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

        {/* =================================================
            TIPO DE CENTRO DE COSTO
        ================================================== */}
        <FormControl
          size="small"
          disabled={cargando}
          sx={{
            flex: {
              xs: '1 1 calc(50% - 8px)',
              sm: '1 1 240px',
              lg: '1.4 1 240px',
            },
            minWidth: {
              xs: 0,
              sm: 220,
              lg: 220,
            },
          }}
        >
          <InputLabel>
            Tipo de Centro de Costo
          </InputLabel>
          <Select
            value={
              tipoCcId ?? ''
            }
            label="Tipo de Centro de Costo"
            onChange={
              onTipoCcChange
            }
          >
            <MenuItem value="">
              Todos
            </MenuItem>
            {tiposCentroCosto.map(
              (tipo) => (
                <MenuItem
                  key={
                    tipo.id_tip_cc
                  }
                  value={
                    tipo.id_tip_cc
                  }
                >
                  {
                    tipo.des_tip_cc
                  }
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
        {/* =================================================
            TIPO DE MAQUINARIA
        ================================================== */}
        {mostrarTipoMaquinaria && (
          <FormControl
            size="small"
            disabled={
              cargando ||
              !tipoCcId
            }
            sx={{
              flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 180px' },
              minWidth: { xs: 0, sm: 160 },
            }}
          >
            <InputLabel>
              Tipo de Maquinaria
            </InputLabel>
            <Select
              value={
                tipoMaqId ?? ''
              }
              label="Tipo de Maquinaria"
              onChange={
                onTipoMaqChange
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
        )}
        {/* =================================================
            COMPARATIVO
        ================================================== */}
        {mostrarComparativo && (
          <FormControl
            size="small"
            disabled={
              cargando ||
              !tipoCcId
            }
            sx={{
              flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 170px' },
              minWidth: { xs: 0, sm: 140 },
            }}
          >
            <InputLabel>
              Comparativo
            </InputLabel>
            <Select
              value={
                comparativoId ?? ''
              }
              label="Comparativo"
              onChange={
                onComparativoChange
              }
            >
              <MenuItem value="">
                Todos
              </MenuItem>
              {comparativosFiltrados.map(
                (item) => (
                  <MenuItem
                    key={
                      item.id_comparativo
                    }
                    value={
                      item.id_comparativo
                    }
                  >
                    {
                      item.descripcion
                    }
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
        )}
        {/* =================================================
            VARIEDAD
        ================================================== */}
        {mostrarVariedad && (
          <FormControl
            size="small"
            disabled={
              cargando ||
              !tipoCcId
            }
            sx={{
              flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 170px' },
              minWidth: { xs: 0, sm: 140 },
            }}
          >
            <InputLabel>
              Variedad
            </InputLabel>
            <Select
              value={
                variedadId ?? ''
              }
              label="Variedad"
              onChange={
                onVariedadChange
              }
            >
              <MenuItem value="">
                Todas
              </MenuItem>
              {variedadesFiltradas.map(
                (item) => (
                  <MenuItem
                    key={
                      item.id_variedad
                    }
                    value={
                      item.id_variedad
                    }
                  >
                    {
                      item.descripcion
                    }
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
        )}
        {/* =================================================
            BUSCAR
        ================================================== */}
        <TextField
          size="small"
          label="Buscar"
          placeholder="Código o descripción"
          value={
            busqueda ?? ''
          }
          onChange={
            onBusquedaChange
          }
          disabled={cargando}
          sx={{
            flex: {
            xs: '2 1 calc(50% - 8px)',
              sm: '1 1 220px',
              lg: '1.3 1 220px',
            },
            minWidth: {
            xs: 0,
              sm: 200,
              lg: 200,
            },
            '& .MuiInputBase-root': {
              backgroundColor:
                'background.paper',
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon
                  sx={{
                    mr: 1,
                    color:
                      'text.secondary',
                    fontSize: 20,
                  }}
                />
              ),
            },
          }}
        />
        {/* =================================================
            ESTADO
        ================================================== */}
        <FormControl
          size="small"
          disabled={cargando}
          sx={{
            flex: {
              xs: '1 1 calc(50% - 8px)',
              sm: '1 1 130px',
              lg: '0 1 130px',
            },
            minWidth: {
              xs: 0,
              sm: 120,
              lg: 120,
            },
          }}
        >
          <InputLabel>
            Estado
          </InputLabel>
          <Select
            value={
              estado ?? ''
            }
            label="Estado"
            onChange={
              onEstadoChange
            }
          >
            <MenuItem value="">
              Todos
            </MenuItem>
            <MenuItem value="ACTIVO">
              Activo
            </MenuItem>
            <MenuItem value="INACTIVO">
              Inactivo
            </MenuItem>
          </Select>
        </FormControl>
        {/* =================================================
            LIMPIAR FILTROS
        ================================================== */}
        <Tooltip
          title="Limpiar filtros"
          arrow
        >
          <span>
            <IconButton
              onClick={
                onLimpiarFiltros
              }
              disabled={
                cargando
              }
              size="small"
              color="primary"
              aria-label="Limpiar filtros"
              sx={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor:
                    'rgba(46, 125, 50, 0.08)',
                },
              }}
            >
              <CleaningServicesIcon
                sx={{
                  fontSize: 19,
                }}
              />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  )
}
export default CentroCostoFilters
