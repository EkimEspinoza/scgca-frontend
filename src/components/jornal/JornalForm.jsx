// Presenta formularios y diálogos de Jornal.
import { AssignmentOutlined, Close as CloseIcon, InfoOutlined, Save } from '@mui/icons-material'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'

export default function JornalForm({ open, modoEdicion, formulario, tiposJornal, erroresFormulario, guardando, onClose, onChange, onSubmit }) {
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}><AssignmentOutlined /></Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar periodo de jornal' : 'Nuevo periodo de jornal'}</Typography>
          <Typography variant="body2" color="text.secondary">{modoEdicion ? 'Al cambiar el rango se actualizarán todos los tipos de jornal de este periodo.' : 'Registra un importe para cada tipo de jornal activo.'}</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: 1 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>Vigencia del importe</Typography>
          <Typography variant="body2" color="text.secondary">El rango debe ser válido y no solaparse con otro periodo.</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="label" htmlFor="jornal-inicio" variant="body2" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>Inicio del periodo</Typography>
            <TextField id="jornal-inicio" type="date" value={formulario.Inicio} onChange={(event) => onChange('Inicio', event.target.value)} error={Boolean(erroresFormulario.Inicio)} helperText={erroresFormulario.Inicio || (modoEdicion ? 'Se actualizará para todos los tipos.' : 'Sugerida: día siguiente al último periodo.')} required fullWidth disabled={guardando} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="label" htmlFor="jornal-fin" variant="body2" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>Fin del periodo</Typography>
            <TextField id="jornal-fin" type="date" value={formulario.Fin} onChange={(event) => onChange('Fin', event.target.value)} error={Boolean(erroresFormulario.Fin)} helperText={erroresFormulario.Fin || (modoEdicion ? 'Se actualizará para todos los tipos.' : 'Debe ser igual o posterior al inicio.')} required fullWidth disabled={guardando} />
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Importes por tipo de jornal</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {tiposJornal.map((tipo) => (
              <TextField
                key={tipo.Id_Tipo_Jornal}
                label={tipo.Descripcion}
                type="number"
                value={formulario.Importes[tipo.Id_Tipo_Jornal] ?? ''}
                onChange={(event) => onChange(`Importes.${tipo.Id_Tipo_Jornal}`, event.target.value)}
                error={Boolean(erroresFormulario[`Importes.${tipo.Id_Tipo_Jornal}`])}
                helperText={erroresFormulario[`Importes.${tipo.Id_Tipo_Jornal}`] || 'Soles por jornal.'}
                inputProps={{ min: 0, step: '0.01' }}
                sx={{ '& input[type=number]': { MozAppearance: 'textfield' }, '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', m: 0 } }}
                required fullWidth disabled={guardando}
              />
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'action.hover' }}>
          <InfoOutlined fontSize="small" color="action" sx={{ mt: '2px' }} />
          <Typography variant="body2" color="text.secondary">El importe 0 se admite cuando un tipo de jornal no tiene un monto definido para ese periodo. Se guardará el periodo completo en una sola operación.</Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
      <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ textTransform: 'none' }}>Cancelar</Button>
      <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ textTransform: 'none', minWidth: 170 }}>{guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Crear periodo'}</Button>
    </DialogActions>
  </Dialog>
}
