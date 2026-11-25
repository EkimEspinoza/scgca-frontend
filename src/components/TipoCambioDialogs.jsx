// Presenta formularios y diálogos de TipoCambio.
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, TextField, Typography } from '@mui/material'
import { CheckCircle, Close as CloseIcon, Save } from '@mui/icons-material'
import { formatearPeriodo } from '../hooks/tipoCambioFormatters'

export default function TipoCambioDialogs({
  dialogPropuestaOpen, setDialogPropuestaOpen, guardando, propuesta, setPropuesta,
  handleConfirmarPropuesta, dialogEdicionOpen, handleCerrarEdicion, tipoSeleccionado,
  formulario, handleChangeFormulario, erroresFormulario, handleGuardarEdicion,
  mensaje, handleCerrarMensaje, error, handleCerrarError,
}) {
  return (
    <>
                {/* DIÁLOGO DE INGRESO MANUAL */}
                <Dialog
                    open={dialogPropuestaOpen}
                    onClose={() => !guardando && setDialogPropuestaOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                            Confirmar tipo de cambio
                        </Typography>
                        <IconButton
                            onClick={() => setDialogPropuestaOpen(false)}
                            disabled={guardando}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {propuesta && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                                <Alert severity="info" sx={{ borderRadius: 1 }}>
                                    El valor inicia en 1.000. Reemplázalo manualmente por el tipo de cambio oficial antes de guardar.
                                </Alert>
                                <Box
                                    sx={{
                                        p: 2.5,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Período consultado
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                        {formatearPeriodo(propuesta.anho, propuesta.mes)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tipo de cambio (editable)
                                    </Typography>
                                    <TextField
                                        label="Tipo de cambio"
                                        type="number"
                                        value={propuesta.tipo_cambio}
                                        onChange={(event) => setPropuesta((actual) => ({
                                            ...actual,
                                            tipo_cambio: event.target.value
                                        }))}
                                        inputProps={{ min: 0, step: '0.001' }}
                                        helperText="Ingresa el valor oficial con hasta tres decimales."
                                        fullWidth
                                        required
                                        sx={{
                                            mt: 1,
                                            '& input[type=number]': { MozAppearance: 'textfield' },
                                            '& input[type=number]::-webkit-outer-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0
                                            },
                                            '& input[type=number]::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0
                                            }
                                        }}
                                    />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    El registro no se guarda hasta que confirmes. Verifica el valor antes de continuar.
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={() => setDialogPropuestaOpen(false)}
                            disabled={guardando}
                            startIcon={<CloseIcon />}
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirmarPropuesta}
                            disabled={guardando || !propuesta}
                            startIcon={
                                guardando
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <CheckCircle />
                            }
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            {guardando ? 'Guardando...' : 'Confirmar y guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>
    
                {/* DIÁLOGO DE EDICIÓN */}
                <Dialog
                    open={dialogEdicionOpen}
                    onClose={handleCerrarEdicion}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                            Editar tipo de cambio
                        </Typography>
                        <IconButton onClick={handleCerrarEdicion} disabled={guardando} size="small">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                label="Período"
                                value={
                                    tipoSeleccionado
                                        ? formatearPeriodo(tipoSeleccionado.anho, tipoSeleccionado.mes)
                                        : ''
                                }
                                fullWidth
                                disabled
                            />
                            <TextField
                                label="Tipo de cambio"
                                name="tipo_cambio"
                                type="number"
                                value={formulario.tipo_cambio}
                                onChange={handleChangeFormulario}
                                error={Boolean(erroresFormulario.tipo_cambio)}
                                helperText={erroresFormulario.tipo_cambio || 'Ingresa el valor con hasta tres decimales.'}
                                inputProps={{ min: 0, step: '0.001' }}
                                fullWidth
                                required
                                disabled={guardando}
                                sx={{
                                    '& input[type=number]': { MozAppearance: 'textfield' },
                                    '& input[type=number]::-webkit-outer-spin-button': {
                                        WebkitAppearance: 'none',
                                        margin: 0
                                    },
                                    '& input[type=number]::-webkit-inner-spin-button': {
                                        WebkitAppearance: 'none',
                                        margin: 0
                                    }
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={handleCerrarEdicion}
                            disabled={guardando}
                            startIcon={<CloseIcon />}
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleGuardarEdicion}
                            disabled={guardando}
                            startIcon={
                                guardando
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <Save />
                            }
                            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            {guardando ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </DialogActions>
                </Dialog>
    
                {/* NOTIFICACIONES */}
                <Snackbar
                    open={Boolean(mensaje)}
                    autoHideDuration={3500}
                    onClose={handleCerrarMensaje}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCerrarMensaje}
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {mensaje}
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={Boolean(error)}
                    autoHideDuration={5000}
                    onClose={handleCerrarError}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCerrarError}
                        severity="error"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
    </>
  )
}

