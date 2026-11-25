// Configura la aplicación y conecta el enrutamiento global.
import { Suspense } from 'react'
import { Box, Typography } from '@mui/material'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' }}>
        <Typography color="text.secondary">Cargando página...</Typography>
      </Box>
    }>
      <AppRoutes />
    </Suspense>
  )
}

export default App
