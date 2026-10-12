import {
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
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            {error && (
 
 
        <Box
                    sx={{
                        border: '1px solid',
                        borderColor: 'error.main',
                        backgroundColor:
                            'rgba(211, 47, 47, 0.06)',
                        borderRadius: 1,
                        px: 2,
                        py: 1.25,
                    }}
                >
 
 
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
                    gap: 2,
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
                    helperText={
                        modoEdicion
                            ? 'Identificador definido por la empresa. No modificable después de crear la campaña.'
                            : 'Identificador definido por la empresa.'
                    }
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
                                key={
                                    empresa.id_empresa
                                }
                                value={String(
                                    empresa.id_empresa,
                                )}
                            >
                                {empresa.descripcion}
                            </MenuItem>
                        ))}
                    </Select>
                    {modoEdicion && (
                        <FormHelperText>
                            Empresa definida para la campaña.
                        </FormHelperText>
                    )}
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
                    {modoEdicion && (
                        <FormHelperText>
                            Centro de Costo definido para la campaña.
                        </FormHelperText>
                    )}
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
                        min: 1,
                        setp: '1',
                    }}
                    sx={{
                        '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                        },
                        '& input[type=number]': {
                            MozAppearance: 'textfield',
                        },
                    }} helperText={
                        'Puede registrar hasta 4 decimales.'
                    }
                />

                <Box
                    sx={{
                        gridColumn: {
                            xs: '1',
                            md: '1 / -1',
                        },
                        border: '1px solid',
                        borderColor: '#E0E5E2',
                        borderRadius: 1.5,
                        p: 2,
                        backgroundColor: '#FAFBFA',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 1.5,
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
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 0.75,
                                    fontWeight: 500,
                                    color: '#4B5563',
                                }}
                            >
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
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 0.75,
                                    fontWeight: 500,
                                    color: '#4B5563',
                                }}
                            >
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
                        border: '1px solid',
                        borderColor: '#E0E5E2',
                        borderRadius: 1.5,
                        p: 2,
                        backgroundColor: '#FAFBFA',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 1.5,
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
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 0.75,
                                    fontWeight: 500,
                                    color: '#4B5563',
                                }}
                            >
                                Fecha de inicio *
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
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 0.75,
                                    fontWeight: 500,
                                    color: '#4B5563',
                                }}
                            >
                                Fecha de fin *
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
                        md: '1fr 1fr',
                    },
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 2,
                        py: 1.5,
                        backgroundColor:
                            'background.paper',
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.75 }}
                    >
                        Estado
                    </Typography>
                    <StatusChip
                        estado={
                            formulario.estado
                        }
                        onClick={
                            !guardando
                                ? onCambiarEstado
                                : undefined
                        }
                        disabled={guardando}
                        activoLabel="Activo"
                        inactivoLabel="Inactivo"
                    />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 0.75 }}
                    >
                    </Typography>
                </Box>
                <Box
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 2,
                        py: 1.5,
                        backgroundColor:
                            'background.paper',
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.75 }}
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
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 0.75 }}
                    >
                    </Typography>
                </Box>
            </Box>
            {modoEdicion && (
                <TextField
                    fullWidth
                    size="small"
                    label="Nombre de campaña"
                    value={formulario.nombre_campana ?? ''}
                    disabled
                    multiline
                    minRows={2}
                    helperText={
                        'El nombre se genera automáticamente según las reglas de campaña.'
                    }
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