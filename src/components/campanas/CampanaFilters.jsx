import {
    Box,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tooltip,
} from '@mui/material'
import {
    CleaningServices as CleaningServicesIcon,
} from '@mui/icons-material'
function CampanaFilters({
    empresas,
    centrosCosto,
    empresaSeleccionada,
    tipoCentroCostoSeleccionado,
    centroCostoSeleccionado,
    estadoFiltro,
    cierreFiltro,
    onEmpresaChange,
    onTipoCentroCostoChange,
    onCentroCostoChange,
    onEstadoChange,
    onCierreChange,
    onLimpiarFiltros,
    loading = false,
}) {
    /*
     * ============================================================
     * TIPOS DE CENTRO DE COSTO
     * ============================================================
     * Se obtienen desde los Centros de Costo ya cargados.
     * No se realiza una consulta adicional a Supabase.
     */
    const tiposCentroCosto = Array.from(
        new Map(
            centrosCosto
                .filter(
                    (centro) =>
                        centro.tipo_centro_costo?.id_tip_cc &&
                        centro.tipo_centro_costo?.des_tip_cc,
                )
                .map(
                    (centro) => [
                        centro.tipo_centro_costo.id_tip_cc,
                        {
                            id_tip_cc: centro.tipo_centro_costo.id_tip_cc,
                            des_tip_cc: centro.tipo_centro_costo.des_tip_cc,
                        },
                    ],
                ),
        ).values(),
    ).sort((a, b) =>
        a.des_tip_cc.localeCompare(b.des_tip_cc, 'es', {
            sensitivity: 'base',
        }),
    )
    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                maxWidth: '100%',
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor:
                    'background.paper',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
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
                        lg: 'nowrap',
                    },
                }}
            >
                {/* =================================================
                    EMPRESA
                ================================================== */}
                <FormControl
                    size="small"
                    disabled={loading}
                    sx={{
                        flex: {
                            xs: '1 1 100%',
                            sm: '1 1 180px',
                            lg: '0 1 180px',
                        },
                        minWidth: {
                            xs: '100%',
                            sm: 160,
                            lg: 160,
                        },
                    }}
                >
                    <InputLabel>
                        Empresa
                    </InputLabel>
                    <Select
                        value={empresaSeleccionada ?? ''}
                        label="Empresa"
                        onChange={onEmpresaChange}
                    >
                        <MenuItem value="">
                            Todas las empresas
                        </MenuItem>
                        {empresas.map(
                            (empresa) => (
                                <MenuItem
                                    key={empresa.id_empresa}
                                    value={empresa.id_empresa}
                                >
                                    {empresa.nombre_comercial}
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
                    disabled={
                        loading ||
                        !empresaSeleccionada
                    }
                    sx={{
                        flex: {
                            xs: '1 1 100%',
                            sm: '1 1 240px',
                            lg: '1.2 1 240px',
                        },
                        minWidth: {
                            xs: '100%',
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
                            tipoCentroCostoSeleccionado ?? ''
                        }
                        label="Tipo de Centro de Costo"
                        onChange={
                            onTipoCentroCostoChange
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
                    CENTRO DE COSTO
                ================================================== */}
                <FormControl
                    size="small"
                    disabled={
                        loading ||
                        !empresaSeleccionada
                    }
                    sx={{
                        flex: {
                            xs: '1 1 100%',
                            sm: '1 1 240px',
                            lg: '1.4 1 240px',
                        },
                        minWidth: {
                            xs: '100%',
                            sm: 220,
                            lg: 220,
                        },
                    }}
                >
                    <InputLabel>
                        Centro de Costo
                    </InputLabel>
                    <Select
                        value={
                            centroCostoSeleccionado ?? ''
                        }
                        label="Centro de Costo"
                        onChange={
                            onCentroCostoChange
                        }
                    >
                        <MenuItem value="">
                            Todos
                        </MenuItem>
                        {centrosCosto
                            .filter(
                                (centro) =>
                                    !tipoCentroCostoSeleccionado ||
                                    String(
                                        centro.tipo_centro_costo
                                            ?.id_tip_cc,
                                    ) ===
                                    String(
                                        tipoCentroCostoSeleccionado,
                                    ),
                            )
                            .sort((a, b) =>
                                (a.desc_cc ?? '').localeCompare(
                                    b.desc_cc ?? '',
                                    'es',
                                    { sensitivity: 'base' },
                                ),
                            )
                            .map(
                                (centro) => (
                                    <MenuItem
                                        key={
                                            centro.cod_cc_pk
                                        }
                                        value={
                                            centro.cod_cc_pk
                                        }
                                    >
                                        {centro.cod_cc}
                                        {' - '}
                                        {centro.desc_cc}
                                    </MenuItem>
                                ),
                            )}
                    </Select>
                </FormControl>
                {/* =================================================
                    ESTADO
                ================================================== */}
                <FormControl
                    size="small"
                    disabled={loading}
                    sx={{
                        flex: {
                            xs: '1 1 100%',
                            sm: '1 1 130px',
                            lg: '0 1 130px',
                        },
                        minWidth: {
                            xs: '100%',
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
                            estadoFiltro ?? ''
                        }
                        label="Estado"
                        onChange={
                            onEstadoChange
                        }
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
                {/* =================================================
                    CIERRE
                ================================================== */}
                <FormControl
                    size="small"
                    disabled={loading}
                    sx={{
                        flex: {
                            xs: '1 1 100%',
                            sm: '1 1 130px',
                            lg: '0 1 130px',
                        },
                        minWidth: {
                            xs: '100%',
                            sm: 120,
                            lg: 120,
                        },
                    }}
                >
                    <InputLabel>
                        Cierre
                    </InputLabel>
                    <Select
                        value={
                            cierreFiltro ?? ''
                        }
                        label="Cierre"
                        onChange={
                            onCierreChange
                        }
                    >
                        <MenuItem value="">
                            Todos
                        </MenuItem>
                        <MenuItem value="false">
                            Abierta
                        </MenuItem>
                        <MenuItem value="true">
                            Cerrada
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
                            disabled={loading}
                            size="small"
                            color="primary"
                            aria-label="Limpiar filtros"
                            sx={{
                                width: 38,
                                height: 38,
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
                                    fontSize: 21,
                                }}
                            />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Paper>
    )
}
export default CampanaFilters