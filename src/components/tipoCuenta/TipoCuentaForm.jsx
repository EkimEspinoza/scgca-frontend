// Presenta el formulario para crear o editar un tipo de cuenta.
import { AssignmentOutlined, Close as CloseIcon, InfoOutlined, Save } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'

export default function TipoCuentaForm({ open, modoEdicion, formulario, erroresFormulario, guardando, onClose, onChange, onSubmit }) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}><AssignmentOutlined /></Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar Tipo de Cuenta' : 'Nuevo Tipo de Cuenta'}</Typography>
          <Typography variant="body2" color="text.secondary">Administra las categorías de cuenta de Servicios.</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1 }}>
        <TextField label="Descripción" name="DESCRIPCION_TIPO_CUENTA" value={formulario.DESCRIPCION_TIPO_CUENTA} onChange={onChange} slotProps={{ htmlInput: { style: { textTransform: 'uppercase' }, maxLength: 100 } }} error={Boolean(erroresFormulario.DESCRIPCION_TIPO_CUENTA)} helperText={erroresFormulario.DESCRIPCION_TIPO_CUENTA || 'Ingresa una descripción para el tipo de cuenta.'} required fullWidth disabled={guardando} autoFocus />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <InfoOutlined fontSize="small" color="action" sx={{ mt: '2px' }} />
          <Typography variant="body2" color="text.secondary">El código se asigna automáticamente y el estado inicial será Activo.</Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
      <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ textTransform: 'none' }}>Cancelar</Button>
      <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ textTransform: 'none', minWidth: 180 }}>{guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Crear Tipo de Cuenta'}</Button>
    </DialogActions>
  </Dialog>
}
