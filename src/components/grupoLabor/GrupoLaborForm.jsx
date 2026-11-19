import { AssignmentOutlined, Close as CloseIcon, InfoOutlined, Save } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField, Typography } from '@mui/material'

export default function GrupoLaborForm({ open, modoEdicion, formulario, erroresFormulario, guardando, onClose, onChange, onSubmit }) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}>
          <AssignmentOutlined />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar Grupo Labor' : 'Nuevo Grupo Labor'}</Typography>
          <Typography variant="body2" color="text.secondary">Organiza las labores en grupos para su administración.</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>Datos del grupo</Typography>
          <Typography variant="body2" color="text.secondary">Completa la descripción y selecciona el tipo correspondiente.</Typography>
        </Box>
        <TextField
          label="Descripción del grupo"
          name="DescripcionLabor"
          value={formulario.DescripcionLabor}
          onChange={onChange}
          slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
          error={Boolean(erroresFormulario.DescripcionLabor)}
          helperText={erroresFormulario.DescripcionLabor || 'Ingresa el código y nombre del grupo de labor.'}
          required fullWidth disabled={guardando} autoFocus
        />
        <TextField select label="Tipo de grupo" name="TIPO_GRUPO" value={formulario.TIPO_GRUPO} onChange={onChange} required disabled={guardando}>
          <MenuItem value="1">Tipo 1</MenuItem>
          <MenuItem value="2">Tipo 2</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <InfoOutlined fontSize="small" color="action" sx={{ mt: '2px' }} />
          <Typography variant="body2" color="text.secondary">El tipo permite identificar la clasificación general del grupo dentro del catálogo.</Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
      <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ textTransform: 'none' }}>Cancelar</Button>
      <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ textTransform: 'none', minWidth: 170 }}>
        {guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Crear Grupo Labor'}
      </Button>
    </DialogActions>
  </Dialog>
}
