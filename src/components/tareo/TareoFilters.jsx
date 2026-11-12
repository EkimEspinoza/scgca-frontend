import { Box, TextField } from '@mui/material'

export default function TareoFilters({ busqueda, onBusqueda, fechaDesde, onFechaDesde, fechaHasta, onFechaHasta }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(220px, 2fr) repeat(2, minmax(150px, 1fr))' }, gap: 1 }}>
      <TextField
        size="small"
        label="Buscar número o centro de costo"
        value={busqueda}
        onChange={(event) => onBusqueda(event.target.value)}
        fullWidth
      />
      <TextField
        size="small"
        label="Desde"
        type="date"
        value={fechaDesde}
        onChange={(event) => onFechaDesde(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        size="small"
        label="Hasta"
        type="date"
        value={fechaHasta}
        onChange={(event) => onFechaHasta(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </Box>
  )
}
