// Presenta el formulario para crear o editar una cuenta comparativo.
import { AssignmentOutlined, Close as CloseIcon, InfoOutlined, Save } from '@mui/icons-material'
import { Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'

export default function CuentaComparativoForm({ open, modoEdicion, formulario, tiposCuenta, erroresFormulario, guardando, onClose, onChange, onTipoCuentaChange, onSubmit }) {
  const tipoSeleccionado = tiposCuenta.find((tipo) => String(tipo.Id_Tipo_Cuenta) === String(formulario.Id_Tipo_Cuenta)) ?? null
  const opciones = tiposCuenta.filter((tipo) => Number(tipo.estado) === 1 || tipoSeleccionado?.Id_Tipo_Cuenta === tipo.Id_Tipo_Cuenta)

  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}><AssignmentOutlined /></Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar Cuenta Comparativo' : 'Nueva Cuenta Comparativo'}</Typography>
          <Typography variant="body2" color="text.secondary">Vincula la cuenta con su tipo de cuenta.</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1 }}>
        <TextField label="Descripción" name="Des_Cuenta_Comparativo" value={formulario.Des_Cuenta_Comparativo} onChange={onChange} slotProps={{ htmlInput: { maxLength: 200 } }} error={Boolean(erroresFormulario.Des_Cuenta_Comparativo)} helperText={erroresFormulario.Des_Cuenta_Comparativo || 'Ingresa la descripción de la cuenta.'} required fullWidth disabled={guardando} autoFocus />
        <Autocomplete
          options={opciones}
          value={tipoSeleccionado}
          getOptionLabel={(tipo) => tipo ? `${tipo.Id_Tipo_Cuenta} · ${tipo.DESCRIPCION_TIPO_CUENTA}` : ''}
          isOptionEqualToValue={(option, value) => option.Id_Tipo_Cuenta === value.Id_Tipo_Cuenta}
          onChange={(_event, value) => onTipoCuentaChange(value)}
          disabled={guardando}
          renderInput={(params) => <TextField {...params} label="Tipo de Cuenta" required error={Boolean(erroresFormulario.Id_Tipo_Cuenta)} helperText={erroresFormulario.Id_Tipo_Cuenta || 'Selecciona un tipo de cuenta activo.'} />}
        />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <InfoOutlined fontSize="small" color="action" sx={{ mt: '2px' }} />
          <Typography variant="body2" color="text.secondary">El código se asigna automáticamente y el estado inicial será Activo.</Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
      <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ textTransform: 'none' }}>Cancelar</Button>
      <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ textTransform: 'none', minWidth: 180 }}>{guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Crear Cuenta Comparativo'}</Button>
    </DialogActions>
  </Dialog>
}
