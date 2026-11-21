import { useEffect, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material'
import { obtenerEtapasCosto } from '../../services/etapaCostoService'
import { obtenerCatalogoCentrosEditarTareo } from '../../services/tareoService'
import { TIPOS_CC } from '../centroCosto/centroCostoRules'
import SearchableSelect from '../common/SearchableSelect'

const ocultarIncrementales = {
  '& input[type="number"]': { MozAppearance: 'textfield' },
  '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
}

const maxObservacion = 20
const filtrarCentro = (opciones, { inputValue }) => {
  const termino = inputValue.trim().toLocaleLowerCase('es-PE')
  if (!termino) return opciones
  return opciones.filter((centro) => `${centro.cod_cc} ${centro.desc_cc ?? ''}`.toLocaleLowerCase('es-PE').includes(termino))
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
  }
}

export default function TareoForm({ open, registro, pendiente = false, guardando, onClose, onGuardar }) {
  const [valores, setValores] = useState(valoresIniciales(registro))
  const [error, setError] = useState('')
  const [erroresCampo, setErroresCampo] = useState({})
  const [etapasCatalogo, setEtapasCatalogo] = useState([])
  const [cargandoEtapas, setCargandoEtapas] = useState(false)
  const [errorEtapas, setErrorEtapas] = useState('')
  const [centrosCatalogo, setCentrosCatalogo] = useState([])
  const [cargandoCentros, setCargandoCentros] = useState(false)
  const valorEtapaActual = String(valores.etapa_tareo ?? '').trim()
  const etapaSeleccionada = etapasCatalogo.find((etapa) => /^\d+$/.test(valorEtapaActual) && Number(etapa.cod_etapa) === Number(valorEtapaActual))
    ?? etapasCatalogo.find((etapa) => etapa.etapa_costo?.trim().toLocaleLowerCase('es-PE') === valorEtapaActual.toLocaleLowerCase('es-PE'))
  const etapaIdActual = etapaSeleccionada ? String(etapaSeleccionada.cod_etapa) : ''
  const etapasDisponibles = etapasCatalogo.filter((etapa) => etapa.estado || Number(etapa.cod_etapa) === Number(etapaSeleccionada?.cod_etapa))
  const centroSeleccionado = centrosCatalogo.find((centro) => Number(centro.cod_cc) === Number(valores.cod_cc)) ?? null
  const maquinariaSeleccionada = centrosCatalogo.find((centro) => Number(centro.cod_cc) === Number(valores.cod_cc_maq)) ?? null
  const esEquipoOCaptacion = (centro) => [TIPOS_CC.MAQUINARIA, TIPOS_CC.POZOS_RESERVORIOS].includes(Number(centro?.id_tip_cc))
  const esTipoCentroTareo = (centro) => [TIPOS_CC.VIVEROS, TIPOS_CC.LEVANTE, TIPOS_CC.INVERSION_CAMPO].includes(Number(centro?.id_tip_cc))
  const centrosDisponibles = centrosCatalogo.filter((centro) => esTipoCentroTareo(centro) && (centro.estado === true || Number(centro.estado) === 1 || Number(centro.cod_cc_pk) === Number(centroSeleccionado?.cod_cc_pk)))
  const maquinariasDisponibles = centrosCatalogo.filter((centro) => esEquipoOCaptacion(centro) && (centro.estado === true || Number(centro.estado) === 1 || Number(centro.cod_cc_pk) === Number(maquinariaSeleccionada?.cod_cc_pk)))

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
        if (vigente) setEtapasCatalogo(etapas)
      })
      .catch((err) => {
        console.error('Error cargando el catálogo de etapas de costo:', err)
        if (vigente) setErrorEtapas('No se pudo cargar el catálogo de Etapa de Costo.')
      })
      .finally(() => { if (vigente) setCargandoEtapas(false) })
    return () => { vigente = false }
  }, [open])

  useEffect(() => {
    if (!open || !valores.id_empresa) return undefined
    let vigente = true
    setCargandoCentros(true)
    obtenerCatalogoCentrosEditarTareo(valores.id_empresa)
      .then((centros) => { if (vigente) setCentrosCatalogo(centros) })
      .catch((err) => {
        console.error('Error cargando los centros de costo para actualizar Tareo:', err)
        if (vigente) setError('No se pudieron cargar los centros de costo y maquinarias.')
      })
      .finally(() => { if (vigente) setCargandoCentros(false) })
    return () => { vigente = false }
  }, [open, valores.id_empresa])

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
    if (valores.observacion.length > maxObservacion) nuevosErrores.observacion = `La observación no debe superar ${maxObservacion} caracteres.`
    setErroresCampo(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return
    try {
      await onGuardar({ ...valores, etapa_tareo: etapaSeleccionada ? String(etapaSeleccionada.cod_etapa) : '' })
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el movimiento.')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={guardando ? undefined : onClose}
      fullWidth
      maxWidth={false}
      sx={{ '& .MuiDialog-paper': { width: 'min(900px, calc(100vw - 64px)) !important', maxWidth: 'none !important', flex: '0 0 auto' } }}
    >
      <Box component="form" onSubmit={guardar}>
        <DialogTitle>{pendiente ? 'Resolver observación de Tareo' : 'Actualizar movimiento de Tareo'}</DialogTitle>
        <DialogContent dividers>
          {pendiente && <Alert severity="info" sx={{ mb: 1.5 }}>Al guardar, el sistema volverá a validar el registro. Si queda válido, pasará a En proceso; los registros de la empresa y el año pasarán a Procesados cuando ya no queden pendientes.</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, pt: 0.5 }}>
            <TextField label="Nro. parte" value={valores.nro_parte} size="small" disabled />
            <Autocomplete
              options={centrosDisponibles}
              value={centroSeleccionado}
              loading={cargandoCentros}
              filterOptions={filtrarCentro}
              onChange={(_event, centro) => { setValores((actual) => ({ ...actual, cod_cc: centro ? String(centro.cod_cc) : '' })); setErroresCampo((actual) => ({ ...actual, cod_cc: '' })); setError('') }}
              getOptionLabel={(centro) => centro?.desc_cc ?? ''}
              isOptionEqualToValue={(option, value) => Number(option.cod_cc_pk) === Number(value.cod_cc_pk)}
              renderOption={(props, centro) => <Box component="li" {...props} key={centro.cod_cc_pk} sx={{ minWidth: 0, gap: 1 }}><Typography variant="caption" color="text.secondary">{centro.cod_cc}</Typography><Typography noWrap title={centro.desc_cc}>{centro.desc_cc}</Typography></Box>}
              renderInput={(params) => <TextField {...params} label="Centro de costo" placeholder="Buscar centro de costo" required error={Boolean(erroresCampo.cod_cc)} helperText={erroresCampo.cod_cc} />}
              disabled={guardando || cargandoCentros}
            />
            <Autocomplete
              options={maquinariasDisponibles}
              value={maquinariaSeleccionada}
              loading={cargandoCentros}
              filterOptions={filtrarCentro}
              onChange={(_event, maquinaria) => { setValores((actual) => ({ ...actual, cod_cc_maq: maquinaria ? String(maquinaria.cod_cc) : '' })); setErroresCampo((actual) => ({ ...actual, cod_cc_maq: '' })); setError('') }}
              getOptionLabel={(maquinaria) => maquinaria?.desc_cc ?? ''}
              isOptionEqualToValue={(option, value) => Number(option.cod_cc_pk) === Number(value.cod_cc_pk)}
              renderOption={(props, maquinaria) => <Box component="li" {...props} key={maquinaria.cod_cc_pk} sx={{ minWidth: 0, gap: 1 }}><Typography variant="caption" color="text.secondary">{maquinaria.cod_cc}</Typography><Typography noWrap title={maquinaria.desc_cc}>{maquinaria.desc_cc}</Typography></Box>}
              renderInput={(params) => <TextField {...params} label="Maquinaria, pozos o reservorios" placeholder="Buscar maquinaria, pozo o reservorio" required error={Boolean(erroresCampo.cod_cc_maq)} helperText={erroresCampo.cod_cc_maq} />}
              disabled={guardando || cargandoCentros}
            />
            <TextField label="Horas" type="number" value={valores.hora} onChange={cambiar('hora')} size="small" required disabled={guardando} error={Boolean(erroresCampo.hora)} helperText={erroresCampo.hora} sx={ocultarIncrementales} slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
            <TextField label="Fecha de tareo" type="date" value={valores.fecha_tareo} onChange={cambiar('fecha_tareo')} size="small" required disabled={guardando} error={Boolean(erroresCampo.fecha_tareo)} helperText={erroresCampo.fecha_tareo} slotProps={{ inputLabel: { shrink: true } }} />
            <SearchableSelect
              label="Etapa de costo"
              value={etapaIdActual}
              options={[{ cod_etapa: '', etapa_costo: 'Sin etapa' }, ...etapasDisponibles]}
              getOptionValue={(etapa) => etapa.cod_etapa === '' ? '' : String(etapa.cod_etapa)}
              getOptionLabel={(etapa) => etapa.etapa_costo}
              onChange={cambiar('etapa_tareo')}
              disabled={guardando || cargandoEtapas}
              error={Boolean(errorEtapas)}
              helperText={errorEtapas || (cargandoEtapas ? 'Cargando etapas…' : '')}
            />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField label="Observación" value={valores.observacion} onChange={cambiar('observacion')} size="small" multiline minRows={1} maxRows={3} fullWidth disabled={guardando} inputProps={{ maxLength: maxObservacion }} error={Boolean(erroresCampo.observacion)} helperText={erroresCampo.observacion || <Typography component="span" variant="caption">{valores.observacion.length}/{maxObservacion} caracteres</Typography>} />
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
