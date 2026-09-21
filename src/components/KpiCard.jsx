import { Box, Card, CardContent, Typography } from '@mui/material'

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {title}
          </Typography>

          {icon && (
            <Box
              sx={{
                color: 'primary.main',
                display: 'flex',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default KpiCard