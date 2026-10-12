import {
  Business,
  Security,
} from '@mui/icons-material'

import {
  Box,
  Grid,
  Paper,
  Typography,
} from '@mui/material'

import { useAuth } from '../context/useAuth'
import { useEmpresa } from '../context/useEmpresa'

import PageTitle from '../components/PageTitle'
import KpiCard from '../components/KpiCard'

function Dashboard() {
  const { perfil } = useAuth()

  const {
    empresas,
    empresaActual,
    loading,
  } = useEmpresa()

  const nombreEmpresa =
    empresaActual?.nombre_comercial ??
    'Todas las empresas'

  if (loading) {
    return <Typography>Cargando...</Typography>
  }

  return (
    <Box>
      <PageTitle
        title="Dashboard"
        subtitle={`Empresa: ${nombreEmpresa}`}
      />

      <Grid container spacing={2}>
        <Grid xs={12} sm={6} md={4}>
          <KpiCard
            title="Empresas disponibles"
            value={empresas.length}
            subtitle="Empresas activas"
            icon={<Business />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <KpiCard
            title="Permiso"
            value={perfil?.permiso?.nombre ?? '-'}
            subtitle="Nivel de acceso"
            icon={<Security />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <KpiCard
            title="Estado de cuenta"
            value={perfil?.estado ?? '-'}
            subtitle="Estado actual"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            minHeight: 280,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 1 }}
          >
            Flujo mensual
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            El gráfico de costos se incorporará cuando
            conectemos la información transaccional.
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default Dashboard