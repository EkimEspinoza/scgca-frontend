import {
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'

function DataTable({
    columns = [],
    rows = [],
    loading = false,
    emptyMessage = 'No existen registros.',
    emptySearchMessage = 'No se encontraron registros para la búsqueda.',
    hasSearch = false,
    getRowKey = (row, index) => row?.id ?? index,
}) {
    return (
        <TableContainer
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
                    <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                        {columns.map((column) => (
                            <TableCell
                                key={column.key}
                                align={column.align || 'left'}
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.secondary',
                                    py: 1,
                                    width: column.width,
                                    ...(column.headerSx || {}),
                                }}
                            >
                                {column.label}
                            </TableCell>
                        ))}
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
                    ) : rows.length === 0 ? (
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
                        rows.map((row, index) => (
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
                                            py: 1,
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
