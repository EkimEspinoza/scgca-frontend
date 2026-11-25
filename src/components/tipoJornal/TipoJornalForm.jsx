// Presenta formularios y diálogos de TipoJornal.
import { AssignmentOutlined, Close as CloseIcon, InfoOutlined, Save } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'

export default function TipoJornalForm({ open, modoEdicion, formulario, erroresFormulario, guardando, onClose, onChange, onSubmit }) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}>
          <AssignmentOutlined />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar Tipo de Jornal' : 'Nuevo Tipo de Jornal'}</Typography>
          <Typography variant="body2" color="text.secondary">Administra las modalidades de jornal del catálogo.</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>Datos del tipo</Typography>
          <Typography variant="body2" color="text.secondary">Escribe una descripción clara para identificarlo en mano de obra.</Typography>
        </Box>
        <TextField label="Descripción" name="Descripcion" value={formulario.Descripcion} onChange={onChange} slotProps={{ htmlInput: { style: { textTransform: 'uppercase' }, maxLength: 100 } }} error={Boolean(erroresFormulario.Descripcion)} helperText={erroresFormulario.Descripcion || 'Ingresa la descripción del tipo de jornal.'} required fullWidth disabled={guardando} autoFocus />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <InfoOutlined fontSize="small" color="action" sx={{ mt: '2px' }} />
          <Typography variant="body2" color="text.secondary">La descripción se mostrará al seleccionar el tipo de jornal asociado a una Labor Final.</Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
      <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ textTransform: 'none' }}>Cancelar</Button>
      <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ textTransform: 'none', minWidth: 180 }}>{guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Crear Tipo de Jornal'}</Button>
    </DialogActions>
  </Dialog>
}
