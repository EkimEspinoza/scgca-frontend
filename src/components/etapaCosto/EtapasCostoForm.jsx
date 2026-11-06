import { Close as CloseIcon, Save } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'

export default function EtapasCostoForm({
  open,
  modoEdicion,
  formulario,
  erroresFormulario,
  guardando,
  onClose,
  onChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {modoEdicion ? 'Editar etapa de costo' : 'Nueva etapa de costo'}
        </Typography>
        <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Etapa de costo"
            name="etapa_costo"
            value={formulario.etapa_costo}
            onChange={onChange}
            error={Boolean(erroresFormulario.etapa_costo)}
            helperText={erroresFormulario.etapa_costo || 'Ingresa el código y el nombre de la etapa.'}
            fullWidth
            required
            disabled={guardando}
            autoFocus
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={guardando}
          startIcon={<CloseIcon />}
          sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={guardando}
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />}
          sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
        >
          {modoEdicion ? 'Guardar cambios' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
