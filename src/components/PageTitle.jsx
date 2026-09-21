import { Box, Typography } from '@mui/material'

function PageTitle({ title, subtitle }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

export default PageTitle