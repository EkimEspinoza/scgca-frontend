import {
    Box,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material'

import {
    Edit as EditIcon,
} from '@mui/icons-material'

function CentroCostoTable({
    centros,
    loading,
    total,
    pagina,
    registrosPorPagina,
    onChangePagina,
    onChangeRegistrosPorPagina,
    onEditar,
}) {
    /*
     * =========================================================
     * COLOR DE LA BARRA LATERAL SEGÚN EMPRESA
     * =========================================================
     */

    const obtenerColorEmpresa = (
        nombreComercial,
    ) => {
        const nombre = (
            nombreComercial || ''
        ).toUpperCase()

        if (
            nombre.includes('RANCHO')
        ) {
            return '#1976D2'
        }

        if (
            nombre.includes('MOCHE') ||
            nombre.includes('SAMNSA')
        ) {
            return '#2E7D32'
        }

        if (
            nombre.includes('MCR')
        ) {
            return '#9C27B0'
        }

        if (
            nombre.includes('CANTERA')
        ) {
            return '#ED6C02'
        }

        return '#BDBDBD'
    }

    /*
     * =========================================================
     * COLOR DEL PUNTO DE ESTADO
     *
     * Verde suave = ACTIVO
     * Rojo suave  = INACTIVO
     * =========================================================
     */

    const obtenerColorEstado = (
        estado,
    ) => {
        return estado
            ? '#66BB6A'
            : '#EF9A9A'
    }

    /*
     * =========================================================
     * COLOR DEL TEXTO DE ESTADO
     * =========================================================
     */

    const obtenerColorTextoEstado = (
        estado,
    ) => {
        return estado
            ? '#388E3C'
            : '#C62828'
    }

    /*
     * =========================================================
     * COLOR DEL TIPO DE CENTRO DE COSTO
     *
     * Se utiliza únicamente en el texto.
     * =========================================================
     */

    const obtenerColorTipoCC = (
        tipo,
    ) => {
        const nombre = (
            tipo || ''
        ).toUpperCase()

        if (
            nombre ===
            'MAQUINARIAS Y EQUIPOS'
        ) {
            return '#1976D2'
        }

        if (
            nombre ===
            'LEVANTE Y MANTENIMIENTO'
        ) {
            return '#2E7D32'
        }

        if (
            nombre ===
            'INVERSIÓN E INSTALACIÓN CAMPO'
        ) {
            return '#E65100'
        }

        if (
            nombre === 'VIVEROS'
        ) {
            return '#8E24AA'
        }

        if (
            nombre.includes(
                'ADMINISTRATIVO',
            )
        ) {
            return '#546E7A'
        }

        if (
            nombre === 'GENÉRICO'
        ) {
            return '#607D8B'
        }

        if (
            nombre.includes(
                'OTROS COSTOS',
            )
        ) {
            return '#795548'
        }

        return '#374151'
    }

    /*
     * =========================================================
     * TEXTO CON VALOR POR DEFECTO
     * =========================================================
     */

    const mostrarValor = (
        valor,
    ) => {
        return valor || '-'
    }

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                height: '100%',
                minWidth: 0,
                minHeight: 0,

                display: 'flex',
                flexDirection: 'column',

                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor:
                    'background.paper',
            }}
        >

            {/* =================================================
                TABLA
            ================================================== */}

            <TableContainer
                sx={{
                    width: '100%',
                    flex: '1 1 0%',
                    minWidth: 0,
                    minHeight: 0,

                    overflowX: 'auto',
                    overflowY: 'auto',
                }}
            >

                <Table
                    stickyHeader
                    size="small"
                    sx={{
                        width: '100%',
                        tableLayout: 'fixed',

                        '& .MuiTableCell-root': {
                            fontSize: '13px',
                        },

                        '& .MuiTypography-root': {
                            fontSize: '13px',
                        },
                    }}
                >

                    {/* =================================================
                        CABECERA
                    ================================================== */}

                    <TableHead>

                        <TableRow>

                            <TableCell
                                sx={{
                                    width: '12%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Empresa
                            </TableCell>

                            <TableCell
                                sx={{
                                    width: '8%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Código CC
                            </TableCell>

                            <TableCell
                                sx={{
                                    width: '21%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Descripción
                            </TableCell>

                            <TableCell
                                sx={{
                                    width: '13%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Tipo CC
                            </TableCell>

                            <TableCell
                                sx={{
                                    width: '13%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Tipo Maquinaria
                            </TableCell>

                            <TableCell
                                sx={{
                                    width: '9%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Comparativo
                            </TableCell>

                            <TableCell
                                sx={{
                                    width: '9%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Variedad
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{
                                    width: '7%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Estado
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{
                                    width: '8%',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    backgroundColor:
                                        '#F8FAF9',
                                    color:
                                        '#1F2937',
                                    py: 1.25,
                                }}
                            >
                                Acción
                            </TableCell>

                        </TableRow>

                    </TableHead>

                    {/* =================================================
                        CUERPO
                    ================================================== */}

                    <TableBody>

                        {/* =================================================
                            CARGANDO
                        ================================================== */}

                        {loading ? (

                            <TableRow>

                                <TableCell
                                    colSpan={9}
                                    align="center"
                                    sx={{
                                        py: 6,
                                    }}
                                >

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Cargando centros de costo...
                                    </Typography>

                                </TableCell>

                            </TableRow>

                        ) : centros.length === 0 ? (

                            /* =================================================
                               SIN RESULTADOS
                            ================================================== */

                            <TableRow>

                                <TableCell
                                    colSpan={9}
                                    align="center"
                                    sx={{
                                        py: 6,
                                    }}
                                >

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        No se encontraron centros de costo.
                                    </Typography>

                                </TableCell>

                            </TableRow>

                        ) : (

                            /* =================================================
                               REGISTROS
                            ================================================== */

                            centros.map(
                                (centro) => {

                                    const colorEmpresa =
                                        obtenerColorEmpresa(
                                            centro
                                                .empresa
                                                ?.nombre_comercial,
                                        )

                                    const colorEstado =
                                        obtenerColorEstado(
                                            centro.estado,
                                        )

                                    const colorTextoEstado =
                                        obtenerColorTextoEstado(
                                            centro.estado,
                                        )

                                    const tipoCC =
                                        centro
                                            .tipo_cc
                                            ?.des_tip_cc

                                    const colorTipoCC =
                                        obtenerColorTipoCC(
                                            tipoCC,
                                        )

                                    return (
                                        <TableRow
                                            key={
                                                centro.cod_cc_pk
                                            }
                                            hover
                                            sx={{
                                                backgroundColor:
                                                    '#FFFFFF',

                                                '&:hover': {
                                                    backgroundColor:
                                                        '#F8FAF9',
                                                },

                                                '& td': {
                                                    borderBottom:
                                                        '1px solid #E8ECEA',
                                                },

                                                '&:last-child td':
                                                    {
                                                        borderBottom:
                                                            'none',
                                                    },

                                                /*
                                                 * Barra lateral
                                                 * de empresa.
                                                 */
                                                '& td:first-of-type':
                                                    {
                                                        borderLeft:
                                                            `4px solid ${colorEmpresa}`,
                                                    },
                                            }}
                                        >

                                            {/* ======================================
                                                EMPRESA
                                            ======================================= */}

                                            <TableCell
                                                sx={{
                                                    fontWeight: 500,
                                                    whiteSpace:
                                                        'nowrap',
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                    py: 1.15,
                                                    pl: 1.5,
                                                }}
                                            >

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 500,
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                    title={
                                                        centro
                                                            .empresa
                                                            ?.nombre_comercial
                                                    }
                                                >
                                                    {
                                                        mostrarValor(
                                                            centro
                                                                .empresa
                                                                ?.nombre_comercial,
                                                        )
                                                    }
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                CÓDIGO CC
                                            ======================================= */}

                                            <TableCell
                                                sx={{
                                                    whiteSpace:
                                                        'nowrap',
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                    fontWeight: 600,
                                                    py: 1.15,
                                                }}
                                            >
                                                {
                                                    centro.cod_cc
                                                }
                                            </TableCell>

                                            {/* ======================================
                                                DESCRIPCIÓN
                                            ======================================= */}

                                            <TableCell
                                                sx={{
                                                    fontWeight: 500,
                                                    py: 1.15,
                                                }}
                                            >

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 500,
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                    title={
                                                        centro.desc_cc
                                                    }
                                                >
                                                    {
                                                        mostrarValor(
                                                            centro.desc_cc,
                                                        )
                                                    }
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                TIPO CC
                                            ======================================= */}

                                            <TableCell
                                                sx={{
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                    whiteSpace:
                                                        'nowrap',
                                                    py: 1.15,
                                                }}
                                            >

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color:
                                                            colorTipoCC,
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                    title={
                                                        tipoCC
                                                    }
                                                >
                                                    {
                                                        mostrarValor(
                                                            tipoCC,
                                                        )
                                                    }
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                TIPO MAQUINARIA
                                            ======================================= */}

                                            <TableCell
                                                sx={{
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                    whiteSpace:
                                                        'nowrap',
                                                    py: 1.15,
                                                }}
                                            >

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                    title={
                                                        centro
                                                            .tipo_maq
                                                            ?.des_tipo_maquinaria
                                                    }
                                                >
                                                    {
                                                        mostrarValor(
                                                            centro
                                                                .tipo_maq
                                                                ?.des_tipo_maquinaria,
                                                        )
                                                    }
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                COMPARATIVO
                                            ======================================= */}

                                            <TableCell
                                                sx={{
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                    whiteSpace:
                                                        'nowrap',
                                                    py: 1.15,
                                                }}
                                            >

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                    title={
                                                        centro
                                                            .comparativo
                                                            ?.descripcion
                                                    }
                                                >
                                                    {
                                                        mostrarValor(
                                                            centro
                                                                .comparativo
                                                                ?.descripcion,
                                                        )
                                                    }
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                VARIEDAD
                                            ======================================= */}

                                            <TableCell
                                                sx={{
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                    whiteSpace:
                                                        'nowrap',
                                                    py: 1.15,
                                                }}
                                            >

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        overflow:
                                                            'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace:
                                                            'nowrap',
                                                    }}
                                                    title={
                                                        centro
                                                            .variedad
                                                            ?.descripcion
                                                    }
                                                >
                                                    {
                                                        mostrarValor(
                                                            centro
                                                                .variedad
                                                                ?.descripcion,
                                                        )
                                                    }
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                ESTADO
                                                Punto + texto
                                            ======================================= */}

                                            <TableCell
                                                align="center"
                                                sx={{
                                                    py: 1.15,
                                                }}
                                            >

                                                <Box
                                                    sx={{
                                                        display:
                                                            'inline-flex',
                                                        alignItems:
                                                            'center',
                                                        justifyContent:
                                                            'center',
                                                        gap: 0.75,
                                                    }}
                                                >

                                                    {/* PUNTO */}

                                                    <Box
                                                        sx={{
                                                            width: 7,
                                                            height: 7,
                                                            minWidth: 7,
                                                            borderRadius:
                                                                '50%',
                                                            backgroundColor:
                                                                colorEstado,
                                                        }}
                                                    />

                                                    {/* TEXTO */}

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color:
                                                                colorTextoEstado,
                                                        }}
                                                    >
                                                        {
                                                            centro.estado
                                                                ? 'Activo'
                                                                : 'Inactivo'
                                                        }
                                                    </Typography>

                                                </Box>

                                            </TableCell>

                                            {/* ======================================
                                                ACCIONES
                                            ======================================= */}

                                            <TableCell
                                                align="center"
                                                sx={{
                                                    py: 1.15,
                                                }}
                                            >

                                                <Box
                                                    sx={{
                                                        display:
                                                            'inline-flex',
                                                        alignItems:
                                                            'center',
                                                        justifyContent:
                                                            'center',
                                                        gap: 0.25,
                                                    }}
                                                >

                                                    {/* ==================================
                                                        EDITAR
                                                    =================================== */}

                                                    <Tooltip
                                                        title="Editar Centro de Costo"
                                                        arrow
                                                    >

                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                onEditar(
                                                                    centro,
                                                                )
                                                            }
                                                            aria-label="Editar Centro de Costo"
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                            }}
                                                        >

                                                            <EditIcon
                                                                fontSize="small"
                                                            />

                                                        </IconButton>

                                                    </Tooltip>

                                                </Box>

                                            </TableCell>

                                        </TableRow>
                                    )
                                },
                            )
                        )}

                    </TableBody>

                </Table>

            </TableContainer>

            {/* =====================================================
                PAGINACIÓN
            ====================================================== */}

            <TablePagination
                component="div"
                count={
                    total
                }
                page={
                    pagina
                }
                onPageChange={
                    onChangePagina
                }
                rowsPerPage={
                    registrosPorPagina
                }
                onRowsPerPageChange={
                    onChangeRegistrosPorPagina
                }
                rowsPerPageOptions={[
                    10,
                    25,
                    50,
                    100,
                ]}
                labelRowsPerPage="Registros por página"
                labelDisplayedRows={({
                    from,
                    to,
                    count,
                }) =>
                    `${from}-${to} de ${
                        count !== -1
                            ? count
                            : `más de ${to}`
                    }`
                }
                sx={{
                    borderTop:
                        '1px solid #E8ECEA',

                    '& .MuiTablePagination-toolbar':
                        {
                            minHeight: 52,
                        },

                    '& .MuiTablePagination-selectLabel':
                        {
                            fontSize: '13px',
                        },

                    '& .MuiTablePagination-displayedRows':
                        {
                            fontSize: '13px',
                        },

                    '& .MuiTablePagination-select':
                        {
                            fontSize: '13px',
                        },
                }}
            />

        </Paper>
    )
}

export default CentroCostoTable