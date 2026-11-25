// Define el componente reutilizable PageHeader.
import { Box, Button, Typography } from '@mui/material'

function PageHeader({
  icon,
  title,
  description,
  summary,
  actionLabel,
  onAction,
  actionIcon,
  sx,
}) {
  return (
    <Box component="header" className="app-page-header" sx={sx}>
      <Box className="app-page-header__main">
        <Box className="app-page-header__copy">
          <Box className="app-page-header__title-row">
            {icon && (
              <Box className="app-page-header__icon" aria-hidden="true">
                {icon}
              </Box>
            )}
            <Typography className="app-page-header__title" variant="h5" component="h1">
              {title}
            </Typography>
          </Box>
          {description && (
            <Typography className="app-page-header__description" variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
          {summary && (
            <Typography className="app-page-header__summary" component="div" variant="caption">
              {summary}
            </Typography>
          )}
        </Box>
      </Box>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={actionIcon}
          onClick={onAction}
          className="app-page-header__action"
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

export default PageHeader
