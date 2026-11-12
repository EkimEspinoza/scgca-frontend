import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'

const ocultarIncrementales = {
  '& input[type="number"]': { MozAppearance: 'textfield' },
  '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
}

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
    estado: registro?.estado ?? '',
  }
}

export default function TareoForm({ open, registro, guardando, onClose, onGuardar }) {
  const [valores, setValores] = useState(valoresIniciales(registro))
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValores(valoresIniciales(registro))
      setError('')
    }
  }, [open, registro])

  const cambiar = (campo) => (event) => {
    setValores((actual) => ({ ...actual, [campo]: event.target.value }))
    setError('')
  }

  const guardar = async (event) => {
    event.preventDefault()
    try {
      await onGuardar(valores)
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el movimiento.')
    }
  }

  return (
    <Dialog open={open} onClose={guardando ? undefined : onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={guardar}>
        <DialogTitle>Actualizar movimiento de Tareo</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, pt: 0.5 }}>
            <TextField label="Nro. parte" value={valores.nro_parte} size="small" disabled />
            <TextField label="Estado" value={String(valores.estado)} size="small" disabled />
            <TextField label="Código de centro de costo" type="number" value={valores.cod_cc} onChange={cambiar('cod_cc')} size="small" required sx={ocultarIncrementales} />
            <TextField label="Código de maquinaria" type="number" value={valores.cod_cc_maq} onChange={cambiar('cod_cc_maq')} size="small" required sx={ocultarIncrementales} />
            <TextField label="Horas" type="number" value={valores.hora} onChange={cambiar('hora')} size="small" required sx={ocultarIncrementales} slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
            <TextField label="Fecha de tareo" type="date" value={valores.fecha_tareo} onChange={cambiar('fecha_tareo')} size="small" required slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Etapa de tareo" value={valores.etapa_tareo} onChange={cambiar('etapa_tareo')} size="small" />
            <TextField label="Observación" value={valores.observacion} onChange={cambiar('observacion')} size="small" multiline minRows={1} maxRows={3} />
          </Box>
          {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando}>Guardar cambios</Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
