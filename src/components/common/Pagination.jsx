// Define el componente reutilizable Pagination.
import {Box,TablePagination,Typography} from '@mui/material'

function Pagination({total,pagina,registrosPorPagina,onPageChange,onRowsPerPageChange,opciones = [10, 15, 25],leadingContent}) {
    const primeraFila = total === 0 ? 0 : pagina * registrosPorPagina + 1
    const ultimaFila = total === 0 ? 0 : Math.min((pagina + 1) * registrosPorPagina,total)

    return (
        <Box
            sx={{
                borderTop: '0px solid',
                backgroundColor:'background.paper',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0,
            }}
        >
            {leadingContent && <Typography variant="body2" color="text.secondary" sx={{ pl: 2, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {leadingContent}
            </Typography>}
            <TablePagination
                component="div"
                count={total}
                page={total === 0 ? 0 : pagina }
                onPageChange={onPageChange}
                rowsPerPage={registrosPorPagina}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={opciones}
                labelRowsPerPage="Registros por página:"
                labelDisplayedRows={() =>
                    total === 0
                        ? '0 de 0'
                        : `${primeraFila}–${ultimaFila} de ${total}`
                }
                sx={{ flex: 1, minWidth: 0, '& .MuiTablePagination-toolbar':{minHeight: 52,px: 1.5},
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':{fontSize:'0.82rem',color:'text.secondary'}}}
            />
        </Box>
    )
}

export default Pagination
