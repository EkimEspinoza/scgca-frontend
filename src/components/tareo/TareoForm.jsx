import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import { obtenerEtapasCosto } from '../../services/etapaCostoService'

const ocultarIncrementales = {
  '& input[type="number"]': { MozAppearance: 'textfield' },
  '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
}

const maxObservacion = 500

function valoresIniciales(registro) {
  return {
    id_empresa: registro?.id_empresa ?? '',
    nro_parte: registro?.nro_parte ?? '',
    cod_cc: registro?.cod_cc ?? '',
    cod_cc_maq: registro?.cod_cc_maq ?? '',
    hora: registro?.hora ?? '',
    fecha_tareo: registro?.fecha_tareo ?? '',
    etapa_tareo: registro?.etapa_tareo ?? '',
    observacion: registro?.observacion ?? '',
  }
}

export default function TareoForm({ open, registro, pendiente = false, guardando, onClose, onGuardar }) {
  const [valores, setValores] = useState(valoresIniciales(registro))
  const [error, setError] = useState('')
  const [erroresCampo, setErroresCampo] = useState({})
  const [etapasCatalogo, setEtapasCatalogo] = useState([])
  const [cargandoEtapas, setCargandoEtapas] = useState(false)
  const [errorEtapas, setErrorEtapas] = useState('')
  const etapasDisponibles = [...new Set([...etapasCatalogo, valores.etapa_tareo].filter(Boolean))]

  useEffect(() => {
    if (open) {
      setValores(valoresIniciales(registro))
      setError('')
      setErroresCampo({})
    }
  }, [open, registro])

  useEffect(() => {
    if (!open) return undefined
    let vigente = true
    setCargandoEtapas(true)
    setErrorEtapas('')
    obtenerEtapasCosto()
      .then((etapas) => {
        if (vigente) setEtapasCatalogo(etapas.filter((etapa) => etapa.estado).map((etapa) => etapa.etapa_costo?.trim()).filter(Boolean))
      })
      .catch((err) => {
        console.error('Error cargando el catálogo de etapas de costo:', err)
        if (vigente) setErrorEtapas('No se pudo cargar el catálogo de Etapa de Costo.')
      })
      .finally(() => { if (vigente) setCargandoEtapas(false) })
    return () => { vigente = false }
  }, [open])

  const cambiar = (campo) => (event) => {
    setValores((actual) => ({ ...actual, [campo]: event.target.value }))
    setError('')
    setErroresCampo((actual) => ({ ...actual, [campo]: '' }))
  }

  const guardar = async (event) => {
    event.preventDefault()
    const nuevosErrores = {}
    if (!valores.cod_cc) nuevosErrores.cod_cc = 'Ingresa el código del centro de costo.'
    if (!valores.cod_cc_maq) nuevosErrores.cod_cc_maq = 'Ingresa el código de maquinaria.'
    if (!valores.hora || Number(valores.hora) <= 0) nuevosErrores.hora = 'Las horas deben ser mayores que cero.'
    if (!valores.fecha_tareo) nuevosErrores.fecha_tareo = 'Selecciona la fecha del tareo.'
    setErroresCampo(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return
    try {
      await onGuardar(valores)
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el movimiento.')
    }
  }

  return (
    <Dialog open={open} onClose={guardando ? undefined : onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={guardar}>
        <DialogTitle>{pendiente ? 'Resolver observación de Tareo' : 'Actualizar movimiento de Tareo'}</DialogTitle>
        <DialogContent dividers>
          {pendiente && <Alert severity="info" sx={{ mb: 1.5 }}>Al guardar, el sistema volverá a validar el registro. Si queda válido, pasará a En proceso; los registros de la empresa y el año pasarán a Procesados cuando ya no queden pendientes.</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, pt: 0.5 }}>
            <TextField label="Nro. parte" value={valores.nro_parte} size="small" disabled />
            <TextField label="Código de centro de costo" type="number" value={valores.cod_cc} onChange={cambiar('cod_cc')} size="small" required disabled={guardando} error={Boolean(erroresCampo.cod_cc)} helperText={erroresCampo.cod_cc} sx={ocultarIncrementales} />
            <TextField label="Código de maquinaria" type="number" value={valores.cod_cc_maq} onChange={cambiar('cod_cc_maq')} size="small" required disabled={guardando} error={Boolean(erroresCampo.cod_cc_maq)} helperText={erroresCampo.cod_cc_maq} sx={ocultarIncrementales} />
            <TextField label="Horas" type="number" value={valores.hora} onChange={cambiar('hora')} size="small" required disabled={guardando} error={Boolean(erroresCampo.hora)} helperText={erroresCampo.hora} sx={ocultarIncrementales} slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
            <TextField label="Fecha de tareo" type="date" value={valores.fecha_tareo} onChange={cambiar('fecha_tareo')} size="small" required disabled={guardando} error={Boolean(erroresCampo.fecha_tareo)} helperText={erroresCampo.fecha_tareo} slotProps={{ inputLabel: { shrink: true } }} />
            <FormControl size="small" fullWidth disabled={guardando || cargandoEtapas} error={Boolean(errorEtapas)}>
              <InputLabel id="etapa-tareo-label">Etapa de tareo</InputLabel>
              <Select labelId="etapa-tareo-label" label="Etapa de tareo" value={valores.etapa_tareo} onChange={cambiar('etapa_tareo')}>
                <MenuItem value="">Sin etapa</MenuItem>
                {etapasDisponibles.map((etapa) => <MenuItem key={etapa} value={etapa}>{etapa}</MenuItem>)}
              </Select>
              {errorEtapas && <Typography variant="caption" color="error.main" sx={{ mt: 0.5 }}>{errorEtapas}</Typography>}
              {cargandoEtapas && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>Cargando etapas…</Typography>}
            </FormControl>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField label="Observación" value={valores.observacion} onChange={cambiar('observacion')} size="small" multiline minRows={1} maxRows={3} fullWidth disabled={guardando} inputProps={{ maxLength: maxObservacion }} helperText={<Typography component="span" variant="caption">{valores.observacion.length}/{maxObservacion} caracteres</Typography>} />
            </Box>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando} startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : null}>{guardando ? 'Guardando…' : 'Guardar cambios'}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
