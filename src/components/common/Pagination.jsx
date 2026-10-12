import {
    Box,
    TablePagination,
} from '@mui/material'


function Pagination({
    total,
    pagina,
    registrosPorPagina,
    onPageChange,
    onRowsPerPageChange,
    opciones = [10, 15, 25],
}) {
    const primeraFila =
        total === 0
            ? 0
            : pagina * registrosPorPagina + 1

    const ultimaFila =
        total === 0
            ? 0
            : Math.min(
                (pagina + 1) *
                    registrosPorPagina,
                total,
            )

    return (
        <Box
            sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor:
                    'background.paper',
            }}
        >
            <TablePagination
                component="div"
                count={total}
                page={
                    total === 0
                        ? 0
                        : pagina
                }
                onPageChange={
                    onPageChange
                }
                rowsPerPage={
                    registrosPorPagina
                }
                onRowsPerPageChange={
                    onRowsPerPageChange
                }
                rowsPerPageOptions={
                    opciones
                }
                labelRowsPerPage="Registros por página:"
                labelDisplayedRows={() =>
                    total === 0
                        ? '0 de 0'
                        : `${primeraFila}–${ultimaFila} de ${total}`
                }
                sx={{
                    '& .MuiTablePagination-toolbar':
                        {
                            minHeight: 52,
                            px: 1.5,
                        },

                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                        {
                            fontSize:
                                '0.82rem',
                            color:
                                'text.secondary',
                        },
                }}
            />
        </Box>
    )
}

export default Pagination