// Presenta el formulario para crear o editar una cuenta.
import { AccountBalanceWalletOutlined, Close as CloseIcon, Save } from '@mui/icons-material'
import { Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'

export default function CuentaForm({ open, modoEdicion, formulario, empresas, comparativos, erroresFormulario, guardando, onClose, onChange, onCatalogChange, onSubmit }) {
  const empresa = empresas.find((item) => String(item.id_empresa) === String(formulario.Id_Empresa)) ?? null
  const comparativo = comparativos.find((item) => String(item.Id_Cuenta_Comparativo) === String(formulario.Id_Cuenta_Comparativo)) ?? null
  const empresasOpciones = empresas.filter((item) => Number(item.estado) === 1 || item.id_empresa === empresa?.id_empresa)
  const comparativosOpciones = comparativos.filter((item) => Number(item.estado) === 1 || item.Id_Cuenta_Comparativo === comparativo?.Id_Cuenta_Comparativo)

  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}><AccountBalanceWalletOutlined /></Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>{modoEdicion ? 'Editar Cuenta' : 'Nueva Cuenta'}</Typography>
          <Typography variant="body2" color="text.secondary">Completa los datos contables y su cuenta comparativo.</Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} disabled={guardando} size="small" aria-label="Cerrar formulario"><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}>
        <Autocomplete
          options={empresasOpciones}
          value={empresa}
          getOptionLabel={(item) => item ? item.nombre_comercial || item.descripcion || `Empresa ${item.id_empresa}` : ''}
          isOptionEqualToValue={(option, value) => option.id_empresa === value.id_empresa}
          onChange={(_event, value) => onCatalogChange({ target: { name: 'Id_Empresa', value: value ? String(value.id_empresa) : '' } })}
          disabled={guardando}
          renderInput={(params) => <TextField {...params} label="Empresa" required error={Boolean(erroresFormulario.Id_Empresa)} helperText={erroresFormulario.Id_Empresa} />}
        />
        <TextField label="Cuenta" name="CUENTA" value={formulario.CUENTA} onChange={onChange} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10 } }} error={Boolean(erroresFormulario.CUENTA)} helperText={erroresFormulario.CUENTA || 'Código contable de la empresa.'} required disabled={guardando} />
        <TextField label="Cuenta PK" name="CUENTA_PK" value={formulario.CUENTA_PK} onChange={onChange} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 15 } }} error={Boolean(erroresFormulario.CUENTA_PK)} helperText={erroresFormulario.CUENTA_PK || 'Código global único de la cuenta.'} required disabled={guardando} />
        <Autocomplete
          options={comparativosOpciones}
          value={comparativo}
          getOptionLabel={(item) => item ? `${item.Id_Cuenta_Comparativo} · ${item.Des_Cuenta_Comparativo}` : ''}
          isOptionEqualToValue={(option, value) => option.Id_Cuenta_Comparativo === value.Id_Cuenta_Comparativo}
          onChange={(_event, value) => onCatalogChange({ target: { name: 'Id_Cuenta_Comparativo', value: value ? String(value.Id_Cuenta_Comparativo) : '' } })}
          disabled={guardando}
          renderInput={(params) => <TextField {...params} label="Cuenta Comparativo" required error={Boolean(erroresFormulario.Id_Cuenta_Comparativo)} helperText={erroresFormulario.Id_Cuenta_Comparativo} />}
        />
        <TextField label="Descripción" name="DESCRIPCION_CUENTA" value={formulario.DESCRIPCION_CUENTA} onChange={onChange} slotProps={{ htmlInput: { maxLength: 250 } }} error={Boolean(erroresFormulario.DESCRIPCION_CUENTA)} helperText={erroresFormulario.DESCRIPCION_CUENTA || 'Descripción asociada al código de cuenta.'} required disabled={guardando} sx={{ gridColumn: { sm: '1 / -1' } }} />
        <Typography variant="caption" color="text.secondary" sx={{ gridColumn: { sm: '1 / -1' } }}>El identificador interno y el estado se administran automáticamente.</Typography>
      </Box>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
      <Button onClick={onClose} disabled={guardando} startIcon={<CloseIcon />} sx={{ textTransform: 'none' }}>Cancelar</Button>
      <Button variant="contained" onClick={onSubmit} disabled={guardando} startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ textTransform: 'none', minWidth: 180 }}>{guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Crear Cuenta'}</Button>
    </DialogActions>
  </Dialog>
}
