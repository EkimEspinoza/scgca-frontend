import {
    Alert,
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material'
import StatusChip from '../common/StatusChip'
function CampanaForm({
    formulario,
    empresas = [],
    centrosCosto = [],
    ultimaCampanaCentroCosto = null,
    cargandoHistorial = false,
    error = '',
    guardando = false,
    modoEdicion = false,
    modoContextual = false,
    onChange,
    onCambiarEstado,
    onCambiarCierre,
    onGuardar,
    onCancelar,
}) {
    const empresaBloqueada =
        modoContextual || guardando
    const centroCostoBloqueado =
        modoContextual || guardando

    const formatearFecha = (fecha) => {
        if (!fecha) return 'sin fecha'
        const [anio, mes, dia] = fecha.split('-')
        return `${dia}/${mes}/${anio}`
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {!modoEdicion && formulario.cod_cc_pk && !cargandoHistorial && (
                <Alert severity="info" variant="outlined" sx={{ py: 0, '& .MuiAlert-message': { py: 0.75 } }}>
                    {ultimaCampanaCentroCosto ? (
                        <>
                            Última campaña: {ultimaCampanaCentroCosto.nombre_campana || `ID ${ultimaCampanaCentroCosto.id_campana_emp}`}. Cierre operativo: {formatearFecha(ultimaCampanaCentroCosto.fecha_fin)}; cierre CTB: {formatearFecha(ultimaCampanaCentroCosto.fecha_fin_ctb)}. Se sugieren como inicios los días siguientes.
                        </>
                    ) : (
                        'Nueva campaña para este Centro de Costo; no tiene campañas anteriores.'
                    )}
                </Alert>
            )}
            {error && (
                <Box
                    sx={{ border: '1px solid', borderColor: 'error.main', backgroundColor: 'rgba(211, 47, 47, 0.06)', borderRadius: 1, px: 2, py: 1.25, }}>
                    <Typography
                        variant="body2"
                        color="error.main"
                    >
                        {error}
                    </Typography>
                </Box>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr',
                    },
                    gap: 1.5,
                }}
            >


                <TextField
                    fullWidth
                    size="small"
                    label="ID campaña empresa"
                    value={
                        formulario.id_campana_emp ?? ''
                    }
                    onChange={(event) =>
                        onChange(
                            'id_campana_emp',
                            event.target.value,
                        )
                    }
                    disabled={
                        modoEdicion ||
                        guardando
                    }
                    required
                    type="number"
                    inputProps={{
                        min: 1,
                        step: '1',
                    }}
                    sx={{
                        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                        },
                        '& input[type=number]': {
                            MozAppearance: 'textfield',
                        },
                    }}
                    helperText={modoEdicion ? 'No se puede cambiar después de crear.' : undefined}
                />


                <FormControl
                    fullWidth
                    size="small"
                    required
                    disabled={
                        modoEdicion ||
                        empresaBloqueada
                    }
                >
                    <InputLabel>
                        Empresa
                    </InputLabel>
                    <Select
                        value={
                            formulario.id_empresa ?? ''
                        }
                        label="Empresa"
                        onChange={(event) =>
                            onChange(
                                'id_empresa',
                                event.target.value,
                            )
                        }
                    >
                        <MenuItem value="">
                            Seleccione una empresa
                        </MenuItem>
                        {empresas.map((empresa) => (
                            <MenuItem
                                key={empresa.id_empresa}
                                value={String(empresa.id_empresa)}
                            >
                                {empresa.descripcion}
                            </MenuItem>
                        ))}
                    </Select>
                    {modoContextual && !modoEdicion && (
                        <FormHelperText>
                            Empresa definida por el Centro
                            de Costo seleccionado.
                        </FormHelperText>
                    )}
                </FormControl>

                <FormControl
                    fullWidth
                    size="small"
                    required
                    disabled={
                        modoEdicion ||
                        centroCostoBloqueado ||
                        !formulario.id_empresa
                    }
                >
                    <InputLabel>
                        Centro de Costo
                    </InputLabel>
                    <Select
                        value={
                            formulario.cod_cc_pk ?? ''
                        }
                        label="Centro de Costo"
                        onChange={(event) =>
                            onChange(
                                'cod_cc_pk',
                                event.target.value,
                            )
                        }
                    >
                        <MenuItem value="">
                            Seleccione un Centro de Costo
                        </MenuItem>
                        {centrosCosto.map(
                            (centroCosto) => (
                                <MenuItem
                                    key={
                                        centroCosto.cod_cc_pk
                                    }
                                    value={String(
                                        centroCosto.cod_cc_pk,
                                    )}
                                >
                                    {centroCosto.cod_cc}
                                    {' - '}
                                    {
                                        centroCosto.desc_cc
                                    }
                                </MenuItem>
                            ),
                        )}
                    </Select>
                    {modoContextual && !modoEdicion && (
                        <FormHelperText>
                            Centro de Costo definido por
                            el contexto seleccionado.
                        </FormHelperText>
                    )}
                </FormControl>
                <TextField
                    fullWidth
                    size="small"
                    label="Hectáreas"
                    value={
                        formulario.hectareas ?? ''
                    }
                    onChange={(event) =>
                        onChange(
                            'hectareas',
                            event.target.value,
                        )
                    }
                    disabled={guardando}
                    required
                    type="number"
                    inputProps={{
                        min: 0.0001,
                        step: 0.0001,
                    }}
                    sx={{
                        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                        },
                        '& input[type=number]': {
                            MozAppearance: 'textfield',
                        },
                    }}
                    helperText="Mayor que 0; hasta 4 decimales."
                />

                <Box
                    sx={{
                        gridColumn: {
                            xs: '1',
                            md: '1 / -1',
                        },
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 1,
                            fontWeight: 700,
                            color: '#1B5E20',
                        }}
                    >
                        Periodo operativo
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1fr 1fr',
                            },
                            gap: 1.5,
                        }}
                    >
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Fecha de inicio *
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={formulario.fecha_inicio ?? ''}
                                onChange={(event) =>
                                    onChange(
                                        'fecha_inicio',
                                        event.target.value,
                                    )
                                }
                                disabled={guardando}
                                required
                                type="date"
                            />
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Fecha de fin *
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={formulario.fecha_fin ?? ''}
                                onChange={(event) =>
                                    onChange(
                                        'fecha_fin',
                                        event.target.value,
                                    )
                                }
                                disabled={guardando}
                                required
                                type="date"
                            />
                        </Box>
                    </Box>
                </Box>
                <Box
                    sx={{
                        gridColumn: {
                            xs: '1',
                            md: '1 / -1',
                        },
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 1,
                            fontWeight: 700,
                            color: '#1B5E20',
                        }}
                    >
                        Periodo CTB
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '1fr 1fr',
                            },
                            gap: 1.5,
                        }}
                    >
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Fecha de inicio CTB *
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={formulario.fecha_inicio_ctb ?? ''}
                                onChange={(event) =>
                                    onChange(
                                        'fecha_inicio_ctb',
                                        event.target.value,
                                    )
                                }
                                disabled={guardando}
                                required
                                type="date"
                            />
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Fecha de fin CTB *
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={formulario.fecha_fin_ctb ?? ''}
                                onChange={(event) =>
                                    onChange(
                                        'fecha_fin_ctb',
                                        event.target.value,
                                    )
                                }
                                disabled={guardando}
                                required
                                type="date"
                            />
                        </Box>
                    </Box>
                </Box>

            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                    },
                    gap: 1.5,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0, minWidth: 120 }}
                    >
                        Cierre de campaña
                    </Typography>
                    <StatusChip
                        estado={!formulario.cierre_camp}
                        cerrado={formulario.cierre_camp}
                        onClick={
                            !guardando
                                ? onCambiarCierre
                                : undefined
                        }
                        disabled={guardando}
                        activoLabel="Abierta"
                        inactivoLabel="Cerrada"
                    />
                </Box>
            </Box>
            {modoEdicion && (
                <TextField
                    fullWidth
                    size="small"
                    label="Nombre de campaña"
                    value={formulario.nombre_campana ?? ''}
                    disabled
                    helperText="Nombre generado automáticamente."
                />
            )}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    pt: 1,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onCancelar}
                    disabled={guardando}
                    sx={{
                        minHeight: 40,
                        borderRadius: 0.8,
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={onGuardar}
                    disabled={guardando}
                    sx={{
                        minHeight: 40,
                        borderRadius: 0.8,
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    {guardando
                        ? 'Guardando...'
                        : modoEdicion
                            ? 'Guardar cambios'
                            : 'Crear campaña'}
                </Button>
            </Box>
        </Box>
    )
}
export default CampanaForm
