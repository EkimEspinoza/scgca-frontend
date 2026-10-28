import { Box, CircularProgress, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, Paper, Divider, Switch } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import StatusChip from '../common/StatusChip'
function formatearFecha(fecha) {
    if (!fecha) { return '' }
    const partes = fecha.split('-')
    if (partes.length !== 3) { return fecha }
    return `${partes[2]}/${partes[1]}/${partes[0]}`
}
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

function mostrarValor(valor) {
    return valor || '-'
}
function CampanaTable({
    campanas = [],
    loading = false,
    eliminando = false,
    emptyMessage = 'No existen campañas registradas.',
    emptySearchMessage = 'No se encontraron campañas para la búsqueda.',
    hasSearch = false,
    cambiandoEstado = false,
    onCambiarEstado,
    onEditar,
}) {
    return (
        <TableContainer
            sx={{
                width: '100%',
                height: 'auto',
                flex: '1 1 0%',
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'auto',
                backgroundColor: 'background.paper',
            }}
        >
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : campanas.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                        {hasSearch ? emptySearchMessage : emptyMessage}
                    </Typography>
                ) : campanas.map((campana) => (
                    <Paper
                        key={campana.id_campana}
                        variant="outlined"
                        sx={{ p: 1.25, borderRadius: 1.25, borderLeft: `3px solid ${obtenerColorEmpresa(campana.empresa?.nombre_comercial)}` }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, overflowWrap: 'anywhere' }}>
                                    {mostrarValor(campana.nombre_campana)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">ID {campana.id_campana_emp}</Typography>
                            </Box>
                            <Tooltip title="Editar campaña" arrow>
                                <span>
                                    <IconButton size="small" disabled={eliminando} onClick={() => onEditar(campana)} aria-label={`Editar campaña ${campana.id_campana_emp}`}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, mt: 0.75 }}>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                <Tooltip title={campana.estado ? 'Desactivar campaña' : 'Reactivar campaña'}>
                                    <span>
                                        <Switch
                                            checked={Boolean(campana.estado)}
                                            onChange={() => onCambiarEstado(campana)}
                                            disabled={eliminando || cambiandoEstado}
                                            size="small"
                                            inputProps={{ 'aria-label': `${campana.estado ? 'Desactivar' : 'Reactivar'} campaña ${campana.id_campana_emp}` }}
                                        />
                                    </span>
                                </Tooltip>
                                <Typography variant="body2" color={campana.estado ? 'success.dark' : 'text.secondary'} fontWeight={600}>
                                    {campana.estado ? 'Activa' : 'Inactiva'}
                                </Typography>
                            </Box>
                            <StatusChip estado={campana.cierre_camp} cerrado={campana.cierre_camp} activoLabel="Cerrada" inactivoLabel="Abierta" />
                        </Box>
                        <Divider sx={{ my: 0.75 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 1.25, rowGap: 0.75 }}>
                            {[
                                ['Empresa', campana.empresa?.nombre_comercial],
                                ['Centro de costo', campana.centro_costo?.desc_cc],
                                ['Periodo', `${formatearFecha(campana.fecha_inicio)} → ${formatearFecha(campana.fecha_fin)}`],
                                ['Hectáreas', Number(campana.hectareas ?? 0).toFixed(4)],
                            ].map(([etiqueta, valor]) => (
                                <Box key={etiqueta} sx={{ minWidth: 0 }}>
                                    <Typography component="div" variant="caption" color="text.secondary">{etiqueta}</Typography>
                                    <Typography component="div" variant="body2" title={valor || ''} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {mostrarValor(valor)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                ))}
            </Box>
            <Table
                stickyHeader
                size="small"
                sx={{
                    width: '100%',
                    display: { xs: 'none', lg: 'table' },
                    tableLayout: 'fixed',
                    flex: '1 1 auto',
                    minHeight: 0,
                    '& .MuiTableHead-root .MuiTableCell-root': { fontSize: '12px', px: 1, py: 0.6 },
                    '& .MuiTableBody-root .MuiTableCell-root': { fontSize: '12px', px: 1, py: 0.3 },
                    '& .MuiTypography-root': { fontSize: '12px' },
                }}
            >
                <TableHead>
                    <TableRow>
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
                            Empresa
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                width: '10%',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                backgroundColor:
                                    '#F8FAF9',
                                color:
                                    '#1F2937',
                                py: 1.25,
                            }}
                        >
                            ID Campaña
                        </TableCell>
                        <TableCell
                            sx={{
                                width: '22%',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                backgroundColor:
                                    '#F8FAF9',
                                color:
                                    '#1F2937',
                                py: 1.25,
                            }}
                        >
                            Nombre de Centro de Costo
                        </TableCell>
                        <TableCell
                            sx={{
                                width: '15%',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                backgroundColor:
                                    '#F8FAF9',
                                color:
                                    '#1F2937',
                                py: 1.25,
                            }}
                        >
                            Periodo
                        </TableCell>
                        <TableCell
                            align="right"
                            sx={{
                                width: '10%',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                backgroundColor:
                                    '#F8FAF9',
                                color:
                                    '#1F2937',
                                py: 1.25,
                            }}
                        >
                            Hectáreas
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                width: '10%',
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
                                width: '10%',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                backgroundColor:
                                    '#F8FAF9',
                                color:
                                    '#1F2937',
                                py: 1.25,
                            }}
                        >
                            Cierre
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                width: '10%',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                backgroundColor:
                                    '#F8FAF9',
                                color:
                                    '#1F2937',
                                py: 1.25,
                            }}
                        >
                            Acciones
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                <CircularProgress
                                    size={28}
                                />
                            </TableCell>
                        </TableRow>
                    ) : campanas.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {hasSearch
                                        ? emptySearchMessage
                                        : emptyMessage}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        campanas.map(
                            (campana) => {
                                const colorEmpresa = obtenerColorEmpresa(campana.empresa?.nombre_comercial)
                                return (
                                    <TableRow
                                        key={campana.id_campana}
                                        hover
                                        sx={{
                                            backgroundColor: '#FFFFFF',
                                            '&:hover': { backgroundColor: '#F8FAF9' },
                                            '& td': { borderBottom: '1px solid #E8ECEA' },
                                            '&:last-child td': { borderBottom: 'none' },
                                            // Barra lateralde empresa
                                            '& td:first-of-type':{ borderLeft: `4px solid ${colorEmpresa}` },
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
                                                title={campana.empresa?.nombre_comercial}>
                                                {mostrarValor(campana.empresa?.nombre_comercial)}
                                            </Typography>
                                        </TableCell>
                                        {/* ======================================
                                            ID CAMPAÑA
                                        ======================================= */}
                                        <TableCell
                                            align='center'
                                            sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5, pl: 1.5, }}>
                                            {campana.id_campana_emp}
                                        </TableCell>
                                        {/* ======================================
                                            NOMBRE DE CENTRO DE COSTO
                                        ======================================= */}
                                        <TableCell
                                            sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5, pl: 1.5, }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }}
                                                title={campana.centro_costo?.desc_cc}
                                            >
                                                {mostrarValor(campana.centro_costo?.desc_cc)}
                                            </Typography>
                                        </TableCell>
                                        {/* ======================================
                                            PERIODO
                                        ======================================= */}
                                        <TableCell
                                            sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5, pl: 1.5, }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }}
                                            >
                                                {formatearFecha(campana.fecha_inicio)}
                                                {' → '}
                                                {formatearFecha(campana.fecha_fin)}
                                            </Typography>
                                        </TableCell>
                                        {/* ======================================
                                            NUMERO DE HECTAREAS
                                        ======================================= */}
                                        <TableCell
                                            align="right"
                                            sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5, pl: 1.5, }}>
                                            {mostrarValor(Number(campana.hectareas ?? 0).toFixed(4))}
                                        </TableCell>
                                        {/* ======================================
                                            ESTADO
                                        ======================================= */}
                                        <TableCell
                                            align="center"
                                            sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5, pl: 1.5, }}>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                                <Tooltip title={campana.estado ? 'Desactivar campaña' : 'Reactivar campaña'}>
                                                    <span>
                                                        <Switch
                                                            checked={Boolean(campana.estado)}
                                                            onChange={() => onCambiarEstado(campana)}
                                                            disabled={eliminando || cambiandoEstado}
                                                            size="small"
                                                            inputProps={{ 'aria-label': `${campana.estado ? 'Desactivar' : 'Reactivar'} campaña ${campana.id_campana_emp}` }}
                                                        />
                                                    </span>
                                                </Tooltip>
                                                <Typography variant="body2" color={campana.estado ? 'success.dark' : 'text.secondary'} fontWeight={600}>
                                                    {campana.estado ? 'Activa' : 'Inactiva'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        {/* ======================================
                                            CIERRE
                                        ======================================= */}
                                        <TableCell
                                            align="center"
                                            sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5, pl: 1.5, }}>

                                            <StatusChip
                                                estado={campana.cierre_camp}
                                                cerrado={campana.cierre_camp}
                                                activoLabel="Cerrada"
                                                inactivoLabel="Abierta"
                                            />
                                        </TableCell>
                                        {/* ======================================
                                            ACCIONES
                                        ======================================= */}
                                        <TableCell
                                            align="center"
                                            sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', py: 0.5, pl: 1.5, }}>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
                                                <Tooltip title="Editar campaña" arrow >
                                                    <IconButton
                                                        size="small"
                                                        disabled={eliminando}
                                                        onClick={() =>onEditar(campana)}
                                                        aria-label="Editar campaña"
                                                        sx={{width: 32,height: 32}}
                                                    >
                                                        <EditIcon fontSize="small"/>
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
    )
}
export default CampanaTable
