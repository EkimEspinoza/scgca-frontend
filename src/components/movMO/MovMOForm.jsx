import { useEffect, useMemo, useState } from 'react'
import { Alert, Autocomplete, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { AddCircleOutlineOutlined, EditOutlined, PaymentsOutlined } from '@mui/icons-material'
import { supabase } from '../../lib/supabase'
import { obtenerLabores } from '../../services/laborService'
import { obtenerEtapasCosto } from '../../services/etapaCostoService'
import { obtenerCentrosCatalogoMO } from '../../services/movMOService'

const fechaLocalHoy = () => {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
}

const valoresIniciales = (registro, empresaInicial, fechaInicial) => ({
  id_empresa: String(registro?.id_empresa ?? empresaInicial ?? ''),
  fec_labor: registro?.fec_labor?.slice(0, 10) ?? fechaInicial ?? fechaLocalHoy(),
  cod_cc_pk: String(registro?.cod_cc_pk ?? ''),
  cod_labor: String(registro?.cod_labor ?? ''),
  imp_labor_sol: registro?.imp_labor_sol ?? '',
  ess_labor_sol: registro?.ess_labor_sol ?? 0,
  etapa_costo: registro?.etapa_costo ?? '',
  obs: registro?.obs ?? '',
})

function esInversionCampo(centro, tipos) {
  const descripcion = tipos.get(Number(centro?.id_tip_cc)) ?? ''
  const textoNormalizado = descripcion.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  return textoNormalizado.includes('INVERSION') && textoNormalizado.includes('CAMPO')
}

export default function MovMOForm({ open, registro, guardando, onClose, onGuardar, modoNuevo = false, soloAjustesProcesado = false, empresaInicial = null, fechaInicial = '' }) {
  const [empresas, setEmpresas] = useState([])
  const [centros, setCentros] = useState([])
  const [labores, setLabores] = useState([])
  const [etapas, setEtapas] = useState([])
  const [tipos, setTipos] = useState(new Map())
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false)
  const [error, setError] = useState('')
  const [valores, setValores] = useState(valoresIniciales(registro, empresaInicial, fechaInicial))
  const centrosPorPk = useMemo(() => new Map(centros.map((centro) => [String(centro.cod_cc_pk), centro])), [centros])
  const centroSeleccionado = centrosPorPk.get(valores.cod_cc_pk) ?? null
  const valorEtapaActual = String(valores.etapa_costo ?? '').trim()
  const etapaSeleccionada = etapas.find((etapa) => /^\d+$/.test(valorEtapaActual) && Number(etapa.cod_etapa) === Number(valorEtapaActual))
    ?? etapas.find((etapa) => etapa.etapa_costo?.trim().toLocaleLowerCase('es-PE') === valorEtapaActual.toLocaleLowerCase('es-PE'))
  const etapaIdActual = etapaSeleccionada ? String(etapaSeleccionada.cod_etapa) : ''
  const requiereEtapa = modoNuevo ? esInversionCampo(centroSeleccionado, tipos) : !soloAjustesProcesado || esInversionCampo(centroSeleccionado, tipos)
  const centrosDisponibles = centros.filter((centro) => String(centro.id_empresa) === valores.id_empresa && (centro.estado || Number(centro.cod_cc_pk) === Number(registro?.cod_cc_pk)))
  const laboresActivas = labores.filter((labor) => Number(labor.estado) === 1 || Number(labor.Id_Lab) === Number(registro?.cod_labor))
  const etapasActivas = etapas.filter((etapa) => etapa.estado || Number(etapa.cod_etapa) === Number(etapaSeleccionada?.cod_etapa))

  useEffect(() => {
    if (!open) return
    let vigente = true
    const valoresDelFormulario = valoresIniciales(modoNuevo ? null : registro, empresaInicial, fechaInicial)
    setValores(valoresDelFormulario)
    setError('')
    setCargandoCatalogos(true)
    Promise.all([
      supabase.from('Dim_Empresa').select('id_empresa,nombre_comercial,descripcion,estado').eq('estado', true).order('nombre_comercial'),
      obtenerCentrosCatalogoMO(valoresDelFormulario.id_empresa),
      obtenerLabores(),
      obtenerEtapasCosto(),
      supabase.from('Dim_TipoCC').select('id_tip_cc,des_tip_cc'),
    ]).then(([empresasResult, centrosResultado, catalogoLabores, catalogoEtapas, tiposResult]) => {
      for (const resultado of [empresasResult, tiposResult]) if (resultado.error) throw resultado.error
      if (!vigente) return
      setEmpresas(empresasResult.data ?? [])
      setCentros(centrosResultado ?? [])
      setLabores(catalogoLabores ?? [])
      setEtapas(catalogoEtapas ?? [])
      setTipos(new Map((tiposResult.data ?? []).map((tipo) => [Number(tipo.id_tip_cc), tipo.des_tip_cc])))
    }).catch((err) => {
      console.error('No se pudieron cargar los catálogos para editar Mov_MO:', err)
      if (vigente) setError(err?.message || 'No se pudieron cargar los catálogos.')
    }).finally(() => { if (vigente) setCargandoCatalogos(false) })
    return () => { vigente = false }
  }, [open, registro, modoNuevo, empresaInicial, fechaInicial])

  const cambiar = (campo) => (event) => setValores((actuales) => ({ ...actuales, [campo]: event.target.value }))
  const guardar = async (event) => {
    event.preventDefault()
    const centro = centrosPorPk.get(valores.cod_cc_pk)
    if (!valores.id_empresa || !centro || ((modoNuevo || !soloAjustesProcesado) && !valores.cod_labor)) {
      setError('Completa la empresa, el centro de costo y la labor requerida.')
      return
    }
    if (requiereEtapa && valorEtapaActual && !etapaSeleccionada) { setError('La etapa seleccionada ya no existe en el catálogo. Elige una etapa válida.'); return }
    if (valores.obs.length > 20) { setError('La observación no debe superar 20 caracteres.'); return }
    if (modoNuevo && !/^\d{4}-\d{2}-\d{2}$/.test(valores.fec_labor)) { setError('Selecciona una fecha válida para el movimiento.'); return }
    if (modoNuevo && (valores.imp_labor_sol === '' || Number(valores.imp_labor_sol) < 0 || Number(valores.ess_labor_sol) < 0)) {
      setError('Ingresa importes válidos. No se permiten valores negativos.')
      return
    }
    try {
      setError('')
      const etapaCostoId = etapaSeleccionada ? Number(etapaSeleccionada.cod_etapa) : null
      const datos = modoNuevo
        ? { id_empresa: Number(valores.id_empresa), fec_labor: valores.fec_labor, cod_cc_pk: centro.cod_cc_pk, cod_cc: centro.cod_cc, cod_labor: Number(valores.cod_labor), labor_scire: labores.find((labor) => Number(labor.Id_Lab) === Number(valores.cod_labor))?.Lab_SCIRE ?? '', imp_labor_sol: Number(valores.imp_labor_sol), ess_labor_sol: Number(valores.ess_labor_sol || 0), etapa_costo: requiereEtapa ? etapaCostoId : null, obs: valores.obs.trim() || 'Ajuste manual' }
        : { cod_cc_pk: centro.cod_cc_pk, cod_cc: centro.cod_cc, ...(!soloAjustesProcesado ? { cod_labor: Number(valores.cod_labor) } : {}), etapa_costo: requiereEtapa ? etapaCostoId : null, obs: valores.obs.trim() || null }
      await onGuardar(datos)
    } catch (err) { setError(err?.message || 'No se pudo guardar el movimiento.') }
  }

  return <Dialog open={open} onClose={guardando ? undefined : onClose} fullWidth maxWidth="md">
    <Box component="form" onSubmit={guardar}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5 }}>
        <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover', flexShrink: 0 }}>
          {modoNuevo ? <AddCircleOutlineOutlined /> : <EditOutlined />}
        </Box>
        <Box>
          <Typography variant="h6" component="div">{modoNuevo ? 'Nuevo registro de Mano de Obra' : 'Actualizar movimiento de Mano de Obra'}</Typography>
          <Typography variant="body2" color="text.secondary">{modoNuevo ? 'Registra un ajuste manual para el periodo seleccionado.' : 'Actualiza el centro de costo y, cuando corresponda, la etapa.'}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, pt: 0.5 }}>
          {modoNuevo && <FormControl size="small" fullWidth required>
            <InputLabel id="mov-mo-new-company-label">Empresa</InputLabel>
            <Select labelId="mov-mo-new-company-label" label="Empresa" value={valores.id_empresa} onChange={(event) => setValores((actuales) => ({ ...actuales, id_empresa: event.target.value, cod_cc_pk: '' }))} disabled={cargandoCatalogos || guardando}>
              {empresas.map((empresa) => <MenuItem key={empresa.id_empresa} value={String(empresa.id_empresa)}>{empresa.nombre_comercial || empresa.descripcion}</MenuItem>)}
            </Select>
          </FormControl>}
          {modoNuevo ? <TextField size="small" type="date" label="Fecha del movimiento" value={valores.fec_labor} onChange={cambiar('fec_labor')} required disabled={guardando} slotProps={{ inputLabel: { shrink: true } }} /> : <TextField size="small" label="Fecha del movimiento" value={new Intl.DateTimeFormat('es-PE').format(new Date(`${valores.fec_labor}T00:00:00`))} disabled />}
          <Autocomplete
            size="small" options={centrosDisponibles} value={centroSeleccionado}
            onChange={(_event, centro) => setValores((actuales) => ({ ...actuales, cod_cc_pk: centro ? String(centro.cod_cc_pk) : '', ...(!centro || !esInversionCampo(centro, tipos) ? { etapa_costo: '' } : {}) }))}
            getOptionLabel={(centro) => `${centro.cod_cc ?? ''} · ${centro.desc_cc ?? ''}`.trim()}
            isOptionEqualToValue={(option, value) => Number(option.cod_cc_pk) === Number(value.cod_cc_pk)}
            renderOption={(props, centro) => <Box component="li" {...props} key={centro.cod_cc_pk} sx={{ minWidth: 0 }}><Typography noWrap title={`${centro.cod_cc ?? ''} · ${centro.desc_cc ?? ''}`}>{centro.cod_cc} · {centro.desc_cc}</Typography></Box>}
            renderInput={(params) => <TextField {...params} required label="Centro de costo" placeholder="Buscar centro" />}
            disabled={cargandoCatalogos || guardando || !valores.id_empresa}
          />
          {!modoNuevo && <TextField size="small" label="Tipo de centro de costo" value={tipos.get(Number(centroSeleccionado?.id_tip_cc)) ?? ''} disabled />}
          {modoNuevo ? <Autocomplete
            size="small" options={laboresActivas} value={laboresActivas.find((labor) => String(labor.Id_Lab) === valores.cod_labor) ?? null}
            onChange={(_event, labor) => setValores((actuales) => ({ ...actuales, cod_labor: labor ? String(labor.Id_Lab) : '' }))}
            getOptionLabel={(labor) => labor?.Lab_SCIRE ?? ''} isOptionEqualToValue={(option, value) => Number(option.Id_Lab) === Number(value.Id_Lab)}
            renderInput={(params) => <TextField {...params} required label="Labor" placeholder="Buscar labor" />}
            disabled={cargandoCatalogos || guardando}
          /> : soloAjustesProcesado ? <TextField size="small" label="Labor" value={registro?.labor?.Lab_SCIRE || registro?.labor_scire || '—'} disabled /> : <FormControl size="small" fullWidth required disabled={cargandoCatalogos || guardando}>
            <InputLabel id="mov-mo-edit-labor-label">Labor</InputLabel>
            <Select labelId="mov-mo-edit-labor-label" label="Labor" value={valores.cod_labor} onChange={cambiar('cod_labor')}>
              {laboresActivas.map((labor) => <MenuItem key={labor.Id_Lab} value={String(labor.Id_Lab)}>{labor.Lab_SCIRE}</MenuItem>)}
            </Select>
          </FormControl>}
          {modoNuevo && <>
            <TextField size="small" type="number" label="Importe S/" value={valores.imp_labor_sol} onChange={cambiar('imp_labor_sol')} required disabled={guardando} inputProps={{ min: 0, step: '0.01', inputMode: 'decimal' }} InputProps={{ startAdornment: <InputAdornment position="start"><PaymentsOutlined fontSize="small" /></InputAdornment> }} sx={{ '& input[type=number]': { appearance: 'textfield' }, '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { display: 'none' } }} />
            <TextField size="small" type="number" label="EsSalud S/" value={valores.ess_labor_sol} onChange={cambiar('ess_labor_sol')} required disabled={guardando} inputProps={{ min: 0, step: '0.01', inputMode: 'decimal' }} InputProps={{ startAdornment: <InputAdornment position="start"><PaymentsOutlined fontSize="small" /></InputAdornment> }} sx={{ '& input[type=number]': { appearance: 'textfield' }, '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { display: 'none' } }} />
          </>}
          {requiereEtapa && <FormControl size="small" fullWidth disabled={cargandoCatalogos || guardando} sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}>
            <InputLabel id="mov-mo-edit-etapa-label">Etapa de costo</InputLabel>
            <Select labelId="mov-mo-edit-etapa-label" label="Etapa de costo" value={etapaIdActual} onChange={cambiar('etapa_costo')}>
              <MenuItem value="">Sin etapa</MenuItem>
              {etapasActivas.map((etapa) => <MenuItem key={etapa.cod_etapa} value={String(etapa.cod_etapa)}>{etapa.etapa_costo}</MenuItem>)}
            </Select>
          </FormControl>}
          <TextField size="small" label="Observación" value={valores.obs} onChange={cambiar('obs')} multiline minRows={2} maxRows={4} inputProps={{ maxLength: 20 }} helperText={`${valores.obs.length}/20 caracteres`} sx={{ gridColumn: '1 / -1' }} />
          {cargandoCatalogos && <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 1 }}><CircularProgress size={16} />Cargando catálogos…</Box>}
        </Box>
        {modoNuevo && <Alert severity="info" sx={{ mt: 2 }}>Este registro se agregará directamente a Procesados para ajustar el mes. La empresa y la fecha determinan el periodo del movimiento.</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={guardando || cargandoCatalogos} startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : null}>{guardando ? 'Guardando…' : modoNuevo ? 'Crear registro' : 'Guardar cambios'}</Button>
      </DialogActions>
    </Box>
  </Dialog>
}
