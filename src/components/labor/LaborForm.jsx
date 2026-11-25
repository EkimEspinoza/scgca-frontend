// Presenta formularios y diálogos de Labor.
import { AssignmentOutlined, Close as CloseIcon, InfoOutlined, Save } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField, Typography } from '@mui/material'

const comparadorEspanol = new Intl.Collator('es', { sensitivity: 'base', numeric: true })

export default function LaborForm({ open, modoEdicion, formulario, laboresFinales, erroresFormulario, guardando, onClose, onChange, onSubmit }) {
  const opcionesLabor = (laboresFinales ?? [])
    .filter((labor) => Number(labor.estado) === 1 || String(labor.Id_Lab_Fin) === formulario.Id_Lab_Fin)
    .slice()
    .sort((a, b) => comparadorEspanol.compare(a.DESCRIPCION ?? '', b.DESCRIPCION ?? ''))

  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}>
          <AssignmentOutlined />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar Labor' : 'Nueva Labor'}</Typography>
          <Typography variant="body2" color="text.secondary">Relaciona el nombre de origen con su clasificación final.</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>Datos de la labor</Typography>
          <Typography variant="body2" color="text.secondary">Completa ambos campos para guardar la asociación.</Typography>
        </Box>
        <TextField
          label="Nombre de la labor en SCIRE"
          name="Lab_SCIRE"
          value={formulario.Lab_SCIRE}
          onChange={onChange}
          error={Boolean(erroresFormulario.Lab_SCIRE)}
          helperText={erroresFormulario.Lab_SCIRE || 'Conserva el nombre tal como aparece en el archivo de origen.'}
          required fullWidth disabled={guardando} autoFocus
        />
        <TextField
          select
          label="Labor Final asociada"
          name="Id_Lab_Fin"
          value={formulario.Id_Lab_Fin}
          onChange={onChange}
          error={Boolean(erroresFormulario.Id_Lab_Fin)}
          helperText={erroresFormulario.Id_Lab_Fin || `${opcionesLabor.length} opciones activas, ordenadas alfabéticamente.`}
          required fullWidth disabled={guardando}
          SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 360 } } } }}
        >
          {opcionesLabor.map((labor) => <MenuItem key={labor.Id_Lab_Fin} value={String(labor.Id_Lab_Fin)}>{labor.DESCRIPCION}</MenuItem>)}
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <InfoOutlined fontSize="small" color="action" sx={{ mt: '2px' }} />
          <Typography variant="body2" color="text.secondary">La Labor Final permite clasificar y agrupar la descripción recibida desde SCIRE.</Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
      <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ textTransform: 'none' }}>Cancelar</Button>
      <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ textTransform: 'none', minWidth: 150 }}>{guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Crear Labor'}</Button>
    </DialogActions>
  </Dialog>
}
