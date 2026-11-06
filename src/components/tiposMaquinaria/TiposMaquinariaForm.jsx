import { Close as CloseIcon, Save } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'

export default function TiposMaquinariaForm({ open, modoEdicion, formulario, erroresFormulario, guardando, onClose, onChange, onSubmit }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar tipo de maquinaria' : 'Nuevo tipo de maquinaria'}</Typography>
        <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Tipo de maquinaria" name="des_tipo_maquinaria" value={formulario.des_tipo_maquinaria} onChange={onChange} error={Boolean(erroresFormulario.des_tipo_maquinaria)} helperText={erroresFormulario.des_tipo_maquinaria || 'La descripción se guardará en mayúsculas.'} fullWidth required sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} disabled={guardando} autoFocus inputProps={{ style: { textTransform: 'uppercase' } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>{modoEdicion ? 'Guardar cambios' : 'Guardar'}</Button>
      </DialogActions>
    </Dialog>
  )
}
