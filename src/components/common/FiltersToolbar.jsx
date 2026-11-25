// Define el componente reutilizable FiltersToolbar.
import { Box, Button, Chip, Divider, Paper, Tooltip, Typography } from '@mui/material'

export function ActiveFilterChips({ filters = [], onClear, disabled = false }) {
  if (!filters.length) return null

  return (
    <Box className="app-active-filters" aria-label="Filtros activos">
      <Typography variant="caption" color="text.secondary">Filtros:</Typography>
      {filters.map((filter) => (
        <Tooltip key={filter.id} title={filter.label}>
          <Chip
            className="app-active-filter-chip"
            size="small"
            variant="outlined"
            label={filter.label}
            onDelete={filter.onRemove}
            disabled={disabled}
          />
        </Tooltip>
      ))}
      {onClear && <Button className="app-clear-filters" color="inherit" size="small" onClick={onClear} disabled={disabled}>Limpiar filtros</Button>}
    </Box>
  )
}

export default function FiltersToolbar({ children, actions, activeFilters = [], onClear, disabled = false, className = '' }) {
  return (
    <Paper className={`app-filters-panel app-filters-toolbar ${className}`.trim()} elevation={0}>
      <Box className={`app-filters-layout${actions ? ' app-filters-layout--with-actions' : ''}`}>
        <Box className="app-filters-controls">{children}</Box>
        {actions && <>
          <Divider className="app-filters-divider" orientation="vertical" flexItem />
          <Box className="app-filters-actions">{actions}</Box>
        </>}
      </Box>
      <ActiveFilterChips filters={activeFilters} onClear={onClear} disabled={disabled} />
    </Paper>
  )
}
