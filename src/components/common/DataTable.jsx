import {
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Tooltip,
    Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'

const tableCollator = new Intl.Collator('es-PE', { numeric: true, sensitivity: 'base' })

function DataTable({
    columns = [],
    rows = [],
    loading = false,
    emptyMessage = 'No existen registros.',
    emptySearchMessage = 'No se encontraron registros para la búsqueda.',
    hasSearch = false,
    getRowKey = (row, index) => row?.id ?? index,
}) {
    const [orden, setOrden] = useState({ campo: '', direccion: 'asc' })
    const filasOrdenadas = useMemo(() => {
        if (!orden.campo) return rows
        const columna = columns.find((item) => item.key === orden.campo)
        if (!columna) return rows
        const obtenerValor = columna.sortValue || ((row) => row?.[columna.key])
        const factor = orden.direccion === 'asc' ? 1 : -1
        return [...rows].sort((a, b) => {
            const valorA = obtenerValor(a)
            const valorB = obtenerValor(b)
            const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
                ? valorA - valorB
                : tableCollator.compare(String(valorA ?? ''), String(valorB ?? ''))
            return comparacion * factor
        })
    }, [rows, columns, orden])
    const cambiarOrden = (campo) => setOrden((actual) => ({
        campo,
        direccion: actual.campo === campo && actual.direccion === 'asc' ? 'desc' : 'asc',
    }))

    return (
        <TableContainer
            className="app-data-table"
            sx={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                backgroundColor: 'background.paper',
            }}
        >
            <Table
            stickyHeader
            
            >
                <TableHead>
                    <TableRow sx={(theme) => ({ backgroundColor: theme.palette.background.default })}>
                        {columns.map((column) => {
                            const sortable = column.sortable !== false && column.key !== 'acciones' && column.key !== 'action'
                            const active = orden.campo === column.key
                            return (
                            <TableCell
                                key={column.key}
                                className={column.key === 'acciones' || column.key === 'action' ? 'app-table-action-cell' : undefined}
                                align={column.align || 'left'}
                                sortDirection={sortable && active ? orden.direccion : false}
                                aria-sort={sortable ? (active ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                                sx={(theme) => ({
                                    fontWeight: 700,
                                    color: 'text.secondary',
                                    ...(theme.scgca?.themeId === 'dark' ? {
                                        fontSize: '0.68rem',
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        color: 'text.primary',
                                    } : {}),
                                    width: column.width,
                                    ...column.headerSx,
                                })}
                            >
                                {sortable ? (
                                    <Tooltip title="Ordenar ascendente o descendente" enterDelay={500}>
                                        <TableSortLabel
                                            active={active}
                                            direction={active ? orden.direccion : 'asc'}
                                            onClick={() => cambiarOrden(column.key)}
                                            aria-label={`Ordenar por ${column.label}${active ? `, ${orden.direccion === 'asc' ? 'ascendente' : 'descendente'}` : ''}`}
                                        >
                                            {column.label}
                                        </TableSortLabel>
                                    </Tooltip>
                                ) : column.label}
                            </TableCell>
                        )})}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length || 1}
                                align="center"
                                sx={{ py: 6, borderBottom: 0 }}
                            >
                                <CircularProgress size={28} />
                            </TableCell>
                        </TableRow>
                    ) : filasOrdenadas.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length || 1}
                                align="center"
                                sx={{ py: 6, borderBottom: 0}}
                            >
                                <Typography color="text.secondary">
                                    {hasSearch
                                        ? emptySearchMessage
                                        : emptyMessage}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filasOrdenadas.map((row, index) => (
                            <TableRow
                                key={getRowKey(row, index)}
                                hover
                                sx={{'&:last-child td, &:last-child th': {borderBottom: 0}}}
                            >
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        align={column.align || 'left'}
                                        sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            ...(column.cellSx || {}),
                                        }}
                                    >
                                        {typeof column.render === 'function'
                                            ? column.render(row)
                                            : row?.[column.key] ?? ''}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default DataTable
