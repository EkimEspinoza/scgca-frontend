import { AssignmentOutlined, Close as CloseIcon, InfoOutlined, Save } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField, Typography } from '@mui/material'

export default function LaborFinalForm({ open, modoEdicion, formulario, gruposLabor, tiposJornal, erroresFormulario, guardando, onClose, onChange, onSubmit }) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}>
          <AssignmentOutlined />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar Labor Final' : 'Nueva Labor Final'}</Typography>
          <Typography variant="body2" color="text.secondary">Define la labor y cómo se clasifica para mano de obra.</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>Datos de la labor</Typography>
          <Typography variant="body2" color="text.secondary">Completa la descripción y selecciona su clasificación.</Typography>
        </Box>
        <TextField
          label="Descripción de la labor"
          name="DESCRIPCION"
          value={formulario.DESCRIPCION}
          onChange={onChange}
          slotProps={{ htmlInput: { maxLength: 200 } }}
          error={Boolean(erroresFormulario.DESCRIPCION)}
          helperText={erroresFormulario.DESCRIPCION || 'Se conservarán las mayúsculas y minúsculas que escribas.'}
          required fullWidth disabled={guardando} autoFocus
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            select
            label="Grupo de labor"
            name="Id_Grupo_Labor"
            value={formulario.Id_Grupo_Labor}
            onChange={onChange}
            error={Boolean(erroresFormulario.Id_Grupo_Labor)}
            helperText={erroresFormulario.Id_Grupo_Labor || 'Grupo al que pertenece.'}
            required fullWidth disabled={guardando}
          >
            {gruposLabor.filter((grupo) => Number(grupo.estado) === 1 || String(grupo.Id_Grupo_Labor) === formulario.Id_Grupo_Labor).map((grupo) => <MenuItem key={grupo.Id_Grupo_Labor} value={String(grupo.Id_Grupo_Labor)}>{grupo.DescripcionLabor}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Tipo de jornal"
            name="id_Tipo_Jornal"
            value={formulario.id_Tipo_Jornal}
            onChange={onChange}
            error={Boolean(erroresFormulario.id_Tipo_Jornal)}
            helperText={erroresFormulario.id_Tipo_Jornal || 'Modalidad de jornal asociada.'}
            required fullWidth disabled={guardando}
          >
            {tiposJornal.filter((tipo) => Number(tipo.estado) === 1 || String(tipo.Id_Tipo_Jornal) === formulario.id_Tipo_Jornal).map((tipo) => <MenuItem key={tipo.Id_Tipo_Jornal} value={String(tipo.Id_Tipo_Jornal)}>{tipo.Descripcion}</MenuItem>)}
          </TextField>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <InfoOutlined fontSize="small" color="action" sx={{ mt: '2px' }} />
          <Typography variant="body2" color="text.secondary">El grupo y el tipo de jornal ayudan a clasificar esta labor en los procesos de mano de obra.</Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
      <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ textTransform: 'none' }}>Cancelar</Button>
      <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ textTransform: 'none', minWidth: 170 }}>{guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Crear Labor Final'}</Button>
    </DialogActions>
  </Dialog>
}
