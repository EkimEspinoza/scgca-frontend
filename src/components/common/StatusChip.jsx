import { Chip } from '@mui/material'

function StatusChip({
    estado,
    cerrado = false,
    onClick,
    activoLabel = 'Activo',
    inactivoLabel = 'Inactivo',
    cerradoLabel = 'Cerrado',
    disabled = false,
}) {
    const activo = Boolean(estado)
    const esCerrado = Boolean(cerrado)
    const esInteractivo =
        Boolean(onClick) &&
        !disabled


    let label = activo
        ? activoLabel
        : inactivoLabel

    let backgroundColor = activo
        ? 'rgba(46, 125, 50, 0.10)'
        : 'rgba(211, 47, 47, 0.10)'

    let color = activo
        ? '#2E7D32'
        : '#D32F2F'

    if (esCerrado) {
        label = cerradoLabel
        backgroundColor = '#212121'
        color = '#FFFFFF'
    }

    return (
        <Chip
            size="small"
            label={label}
            onClick={
                esInteractivo
                    ? onClick
                    : undefined
            }
            disabled={disabled}
            sx={{
                fontWeight: 600,

                backgroundColor,

                color,

                cursor: esInteractivo
                    ? 'pointer'
                    : 'default',

                '&:hover': esInteractivo
                    ? {
                        backgroundColor: activo
                            ? 'rgba(46, 125, 50, 0.18)'
                            : 'rgba(211, 47, 47, 0.18)',
                    }
                    : undefined,

                '&.Mui-disabled': esCerrado
                    ? {
                        backgroundColor: '#212121',
                        color: '#FFFFFF',
                        opacity: 1,
                    }
                    : undefined,
            }}
        />
    )
}

export default StatusChip