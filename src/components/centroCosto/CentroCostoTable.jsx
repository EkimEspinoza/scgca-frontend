import { Box, Divider, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Switch, Tooltip, Typography } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'

function CentroCostoTable({ centros, loading, total, pagina, registrosPorPagina, onChangePagina, onChangeRegistrosPorPagina, onEditar, onCambiarEstado, cambiandoEstado = false }) {
    /*
     * =========================================================
     * COLOR DE LA BARRA LATERAL SEGÚN EMPRESA
     * =========================================================
     */

    const obtenerColorEmpresa = (
        nombreComercial,
    ) => {
        const nombre = (nombreComercial || '').toUpperCase()
        if (nombre.includes('RANCHO')) { return '#1976D2' }
        if (nombre.includes('MOCHE') || nombre.includes('SAMNSA')) { return '#2E7D32' }
        if (nombre.includes('MCR')) { return '#9C27B0' }
        if (nombre.includes('CANTERA')) { return '#ED6C02' }
        return '#BDBDBD'
    }

    /*
     * =========================================================
     * COLOR DEL TIPO DE CENTRO DE COSTO
     *
     * Se utiliza únicamente en el texto.
     * =========================================================
     */

    const obtenerColorTipoCC = (tipo) => {
        const nombre = (tipo || '').toUpperCase()
        if (nombre ==='MAQUINARIAS Y EQUIPOS') {return '#1976D2'}
        if (nombre ==='LEVANTE Y MANTENIMIENTO') {return '#2E7D32'}
        if (nombre ==='INVERSIÓN E INSTALACIÓN CAMPO') {return '#E65100'}
        if (nombre === 'VIVEROS') {return '#8E24AA'}
        if (nombre.includes('ADMINISTRATIVO',)) {return '#546E7A'}
        if (nombre === 'GENÉRICO') {return '#607D8B'}
        if (nombre.includes('OTROS COSTOS',)) {return '#795548'}

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
                backgroundColor:'background.paper',
            }}
        >

            {/* =================================================
                FICHAS PARA PANTALLAS PEQUEÑAS
            ================================================== */}
            <Box
                sx={{
                    display: { xs: 'flex', lg: 'none' },
                    flexDirection: 'column',
                    gap: 0.75,
                    flex: '1 1 0%',
                    minHeight: 0,
                    overflowY: 'auto',
                    p: 0.75,
                }}
            >
                {loading ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                        Cargando centros de costo...
                    </Typography>
                ) : centros.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                        No se encontraron centros de costo.
                    </Typography>
                ) : centros.map((centro) => (
                    <Paper
                        key={centro.cod_cc_pk}
                        variant="outlined"
                        sx={{
                            p: 1.25,
                            borderRadius: 1.25,
                            borderLeft: `3px solid ${obtenerColorEmpresa(centro.empresa?.nombre_comercial)}`,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                                    {mostrarValor(centro.desc_cc)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Código {centro.cod_cc}
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => onEditar(centro)}
                                aria-label={`Editar Centro de Costo ${centro.cod_cc}`}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Box sx={{ mt: 0.75, mb: 0.75 }}>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title={centro.estado ? 'Desactivar Centro de Costo' : 'Activar Centro de Costo'}>
                                <span>
                                    <Switch
                                        checked={Boolean(centro.estado)}
                                        onChange={() => onCambiarEstado(centro)}
                                        disabled={cambiandoEstado}
                                        size="small"
                                        inputProps={{ 'aria-label': `${centro.estado ? 'Desactivar' : 'Activar'} Centro de Costo ${centro.cod_cc}` }}
                                    />
                                </span>
                            </Tooltip>
                            <Typography variant="body2" fontWeight={600} color={centro.estado ? 'success.dark' : 'text.secondary'}>
                                {centro.estado ? 'Activo' : 'Inactivo'}
                            </Typography>
                        </Box>
                        </Box>
                        <Divider sx={{ mb: 0.75 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 1.25, rowGap: 0.75 }}>
                            {[
                                ['Empresa', centro.empresa?.nombre_comercial],
                                ['Tipo de centro', centro.tipo_cc?.des_tip_cc],
                                ['Tipo de maquinaria', centro.tipo_maq?.des_tipo_maquinaria],
                                ['Comparativo', centro.comparativo?.descripcion],
                                ['Variedad', centro.variedad?.descripcion],
                            ].map(([etiqueta, valor]) => (
                                <Box key={etiqueta} sx={{ minWidth: 0 }}>
                                    <Typography component="div" variant="caption" color="text.secondary">
                                        {etiqueta}
                                    </Typography>
                                    <Typography
                                        component="div"
                                        variant="body2"
                                        title={valor || ''}
                                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        {mostrarValor(valor)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                ))}
            </Box>
            {/* =================================================
                TABLA
            ================================================== */}

            <TableContainer
                sx={{ width: '100%', flex: '1 1 0%', minWidth: 0, minHeight: 0, overflowX: 'auto', overflowY: 'auto', display: { xs: 'none', lg: 'block' } }}>
                <Table
                    stickyHeader
                    size="small"
                    sx={{
                        width: '100%',
                        tableLayout: 'fixed',
                        '& .MuiTableHead-root .MuiTableCell-root': { fontSize: '12px', px: 1, py: 0.6 },
                        '& .MuiTableBody-root .MuiTableCell-root': { fontSize: '12px', px: 1, py: 0.3 },
                        '& .MuiTypography-root': { fontSize: '12px' },
                    }}
                >

                    {/* =================================================
                        CABECERA
                    ================================================== */}

                    <TableHead>

                        <TableRow>
                            <TableCell
                                sx={{ width: '12%', fontSize: '11px',fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>
                                Empresa
                            </TableCell>
                            <TableCell
                                sx={{ width: '8%', fontSize: '11px',fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>
                                Código CC
                            </TableCell>

                            <TableCell
                                sx={{ width: '21%', fontSize: '11px',fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>
                                Descripción
                            </TableCell>

                            <TableCell
                                sx={{ width: '13%',fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>
                                Tipo CC
                            </TableCell>

                            <TableCell
                                sx={{ width: '13%', fontSize: '11px',fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>
                                Tipo Maquinaria
                            </TableCell>

                            <TableCell
                                sx={{ width: '9%', fontSize: '11px',fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>

                                Comparativo
                            </TableCell>

                            <TableCell
                                sx={{ width: '7%', fontSize: '11px',fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>
                                Variedad
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{ width: '8%', fontSize: '11px',fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>
                                Estado
                            </TableCell>

                            <TableCell
                                align="center"
                                sx={{ width: '8%', fontSize: '11px',fontWeight: 700, whiteSpace: 'nowrap', backgroundColor: '#F8FAF9', color: '#1F2937', py: 0.5 }}>
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
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Cargando centros de costo...
                                    </Typography>
                                </TableCell>
                            </TableRow>

                        ) : centros.length === 0 ? (

                            /* =================================================
                               SIN RESULTADOS
                            ================================================== */

                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body2" color="text.secondary">
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
                                    const colorEmpresa = obtenerColorEmpresa(centro.empresa?.nombre_comercial)
                                    const tipoCC = centro.tipo_cc?.des_tip_cc
                                    const colorTipoCC = obtenerColorTipoCC(tipoCC)

                                    return (
                                        <TableRow
                                            key={centro.cod_cc_pk}
                                            hover
                                            sx={{
                                                backgroundColor: '#FFFFFF',
                                                '&:hover': { backgroundColor: '#F8FAF9' },
                                                '& td': { borderBottom: '1px solid #E8ECEA' },
                                                '&:last-child td': { borderBottom: 'none' },
                                                // Barra lateral de empresa.
                                                '& td:first-of-type': { borderLeft: `4px solid ${colorEmpresa}` },
                                            }}
                                        >

                                            {/* ======================================
                                                EMPRESA
                                            ======================================= */}

                                            <TableCell
                                                sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5, pl: 1.5, }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }}
                                                    title={centro.empresa?.nombre_comercial}>
                                                    {mostrarValor(centro.empresa?.nombre_comercial,)}
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                CÓDIGO CC
                                            ======================================= */}

                                            <TableCell
                                                sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500, py: 0.5 }}>
                                                {centro.cod_cc}
                                            </TableCell>

                                            {/* ======================================
                                                DESCRIPCIÓN
                                            ======================================= */}

                                            <TableCell
                                                sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500, py: 0.5 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                    title={centro.desc_cc}>
                                                    {mostrarValor(centro.desc_cc,)}
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                TIPO CC
                                            ======================================= */}

                                            <TableCell
                                                sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500, py: 0.5 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600, color: colorTipoCC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }}
                                                    title={tipoCC}>
                                                    {mostrarValor(tipoCC)}
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                TIPO MAQUINARIA
                                            ======================================= */}

                                            <TableCell
                                                sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500, py: 0.5 }}>

                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600,  color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }}
                                                    title={centro.tipo_maq?.des_tipo_maquinaria}>
                                                    {mostrarValor(centro.tipo_maq?.des_tipo_maquinaria,)}
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                COMPARATIVO
                                            ======================================= */}

                                            <TableCell
                                                sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500, py: 0.5 }}>

                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }}
                                                    title={centro.comparativo?.descripcion}>
                                                    {mostrarValor(centro.comparativo?.descripcion)}
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                VARIEDAD
                                            ======================================= */}

                                            <TableCell
                                                sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 500, py: 0.5 }}>

                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }}
                                                    title={centro.variedad?.descripcion}>
                                                    {mostrarValor(centro.variedad?.descripcion)}
                                                </Typography>

                                            </TableCell>

                                            {/* ======================================
                                                ESTADO
                                                Punto + texto
                                            ======================================= */}

                                            <TableCell
                                                align="center"
                                                sx={{ py: 0.5, }}>

                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                    <Tooltip title={centro.estado ? 'Desactivar Centro de Costo' : 'Activar Centro de Costo'}>
                                                        <span>
                                                            <Switch
                                                                checked={Boolean(centro.estado)}
                                                                onChange={() => onCambiarEstado(centro)}
                                                                disabled={cambiandoEstado}
                                                                size="small"
                                                                inputProps={{ 'aria-label': `${centro.estado ? 'Desactivar' : 'Activar'} Centro de Costo ${centro.cod_cc}` }}
                                                            />
                                                        </span>
                                                    </Tooltip>
                                                    <Typography variant="body2" fontWeight={600} color={centro.estado ? 'success.dark' : 'text.secondary'}>
                                                        {centro.estado ? 'Activo' : 'Inactivo'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            {/* ======================================
                                                ACCIONES
                                            ======================================= */}

                                            <TableCell
                                                align="center"
                                                sx={{ py: 0.5, }}>
                                                <Box
                                                    sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>

                                                    {/* ==================================
                                                        EDITAR
                                                    =================================== */}

                                                    <Tooltip
                                                        title="Editar Centro de Costo"
                                                        arrow
                                                    >

                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onEditar(centro)}
                                                            aria-label="Editar Centro de Costo"
                                                            sx={{ width: 32, height: 32 }}
                                                        >

                                                            <EditIcon fontSize="small" />
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
                count={total}
                page={pagina}
                onPageChange={onChangePagina}
                rowsPerPage={registrosPorPagina}
                onRowsPerPageChange={onChangeRegistrosPorPagina}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Registros por página"
                labelDisplayedRows={({
                    from,
                    to,
                    count,
                }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                sx={{
                    borderTop: '1px solid #E8ECEA',
                    flexShrink: 0,
                    '& .MuiTablePagination-toolbar': { minHeight: 48, px: { xs: 0.5, sm: 1.5 }, flexWrap: { xs: 'wrap', sm: 'nowrap' }, justifyContent: { xs: 'center', sm: 'flex-end' } },
                    '& .MuiTablePagination-selectLabel': { fontSize: '12px' },
                    '& .MuiTablePagination-displayedRows': { fontSize: '12px' },
                    '& .MuiTablePagination-select': { fontSize: '12px' },
                }}
            />

        </Paper>
    )
}

export default CentroCostoTable
