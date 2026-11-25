// Define el componente reutilizable UsuarioEmpresasField.
import { Alert, Box, Checkbox, Chip, FormControl, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select, Typography } from '@mui/material'
import { Business as BusinessIcon } from '@mui/icons-material'

export default function UsuarioEmpresasField({ esAdmin, empresas, formulario, errores, manejarCambio }) {
  if (esAdmin) {
    return <Alert severity="info" icon={<BusinessIcon />} sx={{ borderRadius: 1 }}>
      <Typography variant="body2">
        Los usuarios con permiso <strong>ADMIN</strong> tienen acceso a todas las empresas. No es necesario asignarlas individualmente.
      </Typography>
    </Alert>
  }

  return (
    <FormControl fullWidth error={Boolean(errores.empresas)}>
      <InputLabel>Empresas asignadas</InputLabel>
      <Select
        multiple
        value={formulario.empresas}
        onChange={(event) => manejarCambio('empresas', event.target.value.map(Number))}
        input={<OutlinedInput label="Empresas asignadas" />}
        renderValue={(seleccionadas) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {seleccionadas.map((idEmpresa) => {
              const empresa = empresas.find((item) => Number(item.id_empresa) === Number(idEmpresa))
              return <Chip key={idEmpresa} label={empresa?.nombre_comercial ?? idEmpresa} size="small" />
            })}
          </Box>
        )}
        sx={{ minHeight: 42, borderRadius: 1 }}
      >
        {empresas.map((empresa) => (
          <MenuItem key={empresa.id_empresa} value={empresa.id_empresa}>
            <Checkbox checked={formulario.empresas.includes(Number(empresa.id_empresa))} size="small" />
            <Typography variant="body2">{empresa.nombre_comercial}</Typography>
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{errores.empresas || 'Selecciona las empresas a las que tendrá acceso el usuario.'}</FormHelperText>
    </FormControl>
  )
}
