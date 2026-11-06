import { Close as CloseIcon, Save } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'

export default function TiposCentroCostoForm({ open, modoEdicion, formulario, erroresFormulario, guardando, onClose, onChange, onSubmit }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar Tipo de Centro de Costo' : 'Nuevo Tipo de Centro de Costo'}</Typography>
        <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField fullWidth label="Descripción" name="des_tip_cc" value={formulario.des_tip_cc} onChange={onChange} error={Boolean(erroresFormulario.des_tip_cc)} helperText={erroresFormulario.des_tip_cc || 'La descripción se guardará en mayúsculas.'} autoFocus sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 1 } }} required disabled={guardando} inputProps={{ style: { textTransform: 'uppercase' } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>{modoEdicion ? 'Guardar cambios' : 'Guardar'}</Button>
      </DialogActions>
    </Dialog>
  )
}
