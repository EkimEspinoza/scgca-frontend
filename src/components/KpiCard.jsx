import { Box, Card, CardContent, Typography } from '@mui/material'

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <Card className="app-kpi-card" elevation={0}>
      <CardContent className="app-kpi-card__content">
        <Box className="app-kpi-card__header">
          <Typography className="app-kpi-card__label" variant="body2" color="text.secondary">
            {title}
          </Typography>
          {icon && <Box className="app-kpi-card__icon">{icon}</Box>}
        </Box>
        <Typography className="app-kpi-card__value" variant="h4">
          {value}
        </Typography>
        {subtitle && (
          <Typography className="app-kpi-card__subtitle" variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default KpiCard
