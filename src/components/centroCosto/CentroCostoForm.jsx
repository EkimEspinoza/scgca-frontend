import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'

import { crearCentroCosto, actualizarCentroCosto } from '../../services/centroCostoService'

function CentroCostoForm({
  open,
  onClose,
  onSaved,
  centroCostoEditar,
  empresas,
  tiposCentroCosto,
  tiposMaquinaria,
  comparativos,
  variedades,
  loadingMaestros,
}) {
  // Estados del formulario.
  const [empresaId, setEmpresaId] = useState('')
  const [codCc, setCodCc] = useState('')
  const [descCc, setDescCc] = useState('')
  const [tipoCcId, setTipoCcId] = useState('')
  const [tipoMaqId, setTipoMaqId] = useState('')
  const [comparativoId, setComparativoId] = useState('')
  const [variedadId, setVariedadId] = useState('')
  const [estado, setEstado] = useState('true')

  // Estado de validación y guardado.
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState('')

  // Identificadores de tipos que controlan campos dependientes.
  const TIPO_MAQUINARIAS = 3
  const TIPO_LEVANTE = 4
  const TIPO_INVERSION_CAMPO = 15
  const TIPO_VIVEROS = 16

  // Indica si el formulario edita un centro de costo.
  const modoEdicion = Boolean(centroCostoEditar)

  // Elimina el código final de la descripción para evitar duplicarlo al editar.
  const obtenerDescripcionBase = (descripcion, codigo) => {
    if (!descripcion) return ''

    const texto = String(descripcion)

    if (codigo == null) return texto

    const sufijo = ` (${codigo})`

    if (texto.toUpperCase().endsWith(sufijo.toUpperCase())) {
      return texto.slice(0, texto.length - sufijo.length)
    }

    return texto
  }

  // Carga los datos existentes al editar y limpia el formulario al crear.
  useEffect(() => {
    if (!open) {
      return
    }

    // Hydrate/reset controlled form fields when the dialog target changes.
    // eslint-disable-next-line react/set-state-in-effect
    setErrores({})
    setErrorGuardar('')

    // Modo edición.
    if (centroCostoEditar) {
      const codigo = centroCostoEditar.cod_cc

      // La empresa se conserva internamente al editar.
      setEmpresaId(centroCostoEditar.id_empresa != null ? String(centroCostoEditar.id_empresa) : '')

      // El código se conserva internamente, aunque no se muestra.
      setCodCc(codigo != null ? String(codigo) : '')

      // Quita el sufijo con el código de la descripción guardada.
      setDescCc(obtenerDescripcionBase(centroCostoEditar.desc_cc, codigo))

      setTipoCcId(centroCostoEditar.id_tip_cc != null ? String(centroCostoEditar.id_tip_cc) : '')

      setTipoMaqId(centroCostoEditar.id_tipo_maq != null ? String(centroCostoEditar.id_tipo_maq) : '')

      setComparativoId(centroCostoEditar.id_comparativo != null ? String(centroCostoEditar.id_comparativo) : '')

      setVariedadId(centroCostoEditar.id_variedad != null ? String(centroCostoEditar.id_variedad) : '')

      setEstado(centroCostoEditar.estado === true ? 'true' : 'false')

      return
    }

    // Modo nuevo: inicia los campos vacíos.
    setEmpresaId('')
    setCodCc('')
    setDescCc('')
    setTipoCcId('')
    setTipoMaqId('')
    setComparativoId('')
    setVariedadId('')
    setEstado('true')
  }, [open, centroCostoEditar])

  // Muestra campos según el tipo de centro de costo seleccionado.
  const mostrarTipoMaquinaria = Number(tipoCcId) === TIPO_MAQUINARIAS

  const mostrarComparativo = Number(tipoCcId) === TIPO_LEVANTE || Number(tipoCcId) === TIPO_INVERSION_CAMPO

  const mostrarVariedad = Number(tipoCcId) === TIPO_LEVANTE || Number(tipoCcId) === TIPO_INVERSION_CAMPO || Number(tipoCcId) === TIPO_VIVEROS

  const handleEmpresaChange = (event) => {
    setEmpresaId(event.target.value)

    setErrores((prev) => ({
      ...prev,
      empresaId: '',
    }))
  }

  /* CÓDIGO */
  // Solo se solicita al crear un registro.
  const handleCodCcChange = (event) => {
    const valor = event.target.value.replace(/\D/g, '')

    setCodCc(valor)

    setErrores((prev) => ({
      ...prev,
      codCc: '',
    }))
  }

  const handleDescCcChange = (event) => {
    setDescCc(event.target.value.toUpperCase())

    setErrores((prev) => ({
      ...prev,
      descCc: '',
    }))
  }

  const handleTipoCcChange = (event) => {
    const nuevoTipo = event.target.value

    setTipoCcId(nuevoTipo)

    // Limpia los valores que dependen del tipo de centro de costo.
    setTipoMaqId('')
    setComparativoId('')
    setVariedadId('')

    setErrores((prev) => ({
      ...prev,
      tipoCcId: '',
      tipoMaqId: '',
      comparativoId: '',
      variedadId: '',
    }))
  }

  const handleTipoMaqChange = (event) => {
    setTipoMaqId(event.target.value)

    setErrores((prev) => ({
      ...prev,
      tipoMaqId: '',
    }))
  }

  const handleComparativoChange = (event) => {
    setComparativoId(event.target.value)

    setErrores((prev) => ({
      ...prev,
      comparativoId: '',
    }))
  }

  const handleVariedadChange = (event) => {
    setVariedadId(event.target.value)

    setErrores((prev) => ({
      ...prev,
      variedadId: '',
    }))
  }

  const handleEstadoChange = (event) => {
    setEstado(event.target.value)
  }

  // Valida los campos obligatorios antes de enviar los datos.
  const validarFormulario = () => {
    const nuevosErrores = {}

    // La empresa siempre es obligatoria.
    if (!empresaId) {
      nuevosErrores.empresaId = 'Seleccione una empresa.'
    }

    // El código solo es obligatorio al crear.
    if (!modoEdicion) {
      const codigo = Number(codCc)

      if (!codCc) {
        nuevosErrores.codCc = 'Ingrese el código del Centro de Costo.'
      } else if (!Number.isSafeInteger(codigo) || codigo < 0) {
        nuevosErrores.codCc = 'Ingrese un código numérico entero mayor o igual a cero.'
      }
    }

    // La descripción es obligatoria.
    if (!descCc.trim()) {
      nuevosErrores.descCc = 'Ingrese la descripción del Centro de Costo.'
    }

    // El tipo de centro de costo es obligatorio.
    if (!tipoCcId) {
      nuevosErrores.tipoCcId = 'Seleccione el Tipo de Centro de Costo.'
    }

    // El tipo de maquinaria es obligatorio para maquinaria.
    if (Number(tipoCcId) === TIPO_MAQUINARIAS && !tipoMaqId) {
      nuevosErrores.tipoMaqId = 'Seleccione el Tipo de Maquinaria.'
    }

    setErrores(nuevosErrores)

    return Object.keys(nuevosErrores).length === 0
  }

  // Guarda el centro de costo nuevo o actualizado.
  const handleGuardar = async () => {
    setErrorGuardar('')

    if (!validarFormulario()) {
      return
    }

    try {
      setGuardando(true)

      // Actualiza el registro existente.
      if (modoEdicion) {
        // El identificador original es necesario para actualizar.
        if (!centroCostoEditar?.cod_cc_pk) {
          throw new Error('No se encontró el identificador del Centro de Costo.')
        }

        // El identificador y el código originales se conservan al editar.
        const registro = await actualizarCentroCosto({
          codCcPk: centroCostoEditar.cod_cc_pk,
          codCc: centroCostoEditar.cod_cc,
          descripcionBase: descCc.trim(),
          id_tip_cc: tipoCcId,
          id_tipo_maq: tipoMaqId || null,
          id_comparativo: comparativoId || null,
          id_variedad: variedadId || null,
          estado: estado === 'true',
        })

        // Notifica al componente padre que el registro fue actualizado.
        if (onSaved) {
          onSaved(registro, true)
        }

        onClose()

        return
      }

      // Crea el nuevo registro.
      const registro = await crearCentroCosto({
        id_empresa: empresaId,
        cod_cc: codCc,
        descripcionBase: descCc.trim(),
        id_tip_cc: tipoCcId,
        id_tipo_maq: tipoMaqId || null,
        id_comparativo: comparativoId || null,
        id_variedad: variedadId || null,
        estado: estado === 'true',
      })

      // Notifica al componente padre que se creó el registro.
      if (onSaved) {
        onSaved(registro)
      }

      onClose()
    } catch (error) {
      console.error('Error guardando Centro de Costo:', error)

      // Código duplicado.
      if (error?.code === '23505') {
        setErrorGuardar('El código del Centro de Costo ya existe para esta empresa.')
        return
      }

      // Referencia inválida a un maestro.
      if (error?.code === '23503') {
        setErrorGuardar('Uno de los valores seleccionados no existe en los maestros.')
        return
      }

      // Permisos insuficientes según las políticas RLS.
      if (error?.code === '42501') {
        setErrorGuardar(modoEdicion
          ? 'No tienes permisos para modificar este Centro de Costo.'
          : 'No tienes permisos para registrar este Centro de Costo.')
        return
      }

      setErrorGuardar(error?.message || (modoEdicion
        ? 'No se pudo actualizar el Centro de Costo.'
        : 'No se pudo registrar el Centro de Costo.'))
    } finally {
      setGuardando(false)
    }
  }

  // Descripción que se mostrará como vista previa.
  const descripcionPreview = descCc.trim() && codCc ? `${descCc.trim()} (${codCc})` : ''

  return (
    <Dialog
      open={open}
      onClose={guardando ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{modoEdicion ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {errorGuardar && <Alert severity="error">{errorGuardar}</Alert>}

          {/* Empresa */}
          <FormControl
            fullWidth
            error={Boolean(errores.empresaId)}
            disabled={loadingMaestros || guardando || modoEdicion}
          >
            <InputLabel>Empresa</InputLabel>

            <Select
              value={empresaId}
              label="Empresa"
              onChange={handleEmpresaChange}
            >
              <MenuItem value=""><em>Seleccione una empresa</em></MenuItem>

              {empresas.map((empresa) => (
                <MenuItem key={empresa.id_empresa} value={String(empresa.id_empresa)}>
                  {empresa.nombre_comercial}
                </MenuItem>
              ))}
            </Select>

            {errores.empresaId && <FormHelperText>{errores.empresaId}</FormHelperText>}
          </FormControl>

          {/* CÓDIGO */}
          {/* Solo se solicita al crear un registro. */}
          {!modoEdicion && (
            <TextField
              label="Código Centro de Costo"
              value={codCc}
              onChange={handleCodCcChange}
              fullWidth
              disabled={guardando}
              error={Boolean(errores.codCc)}
              helperText={errores.codCc || 'Ingrese un código numérico sin límite fijo de dígitos.'}
              inputProps={{ inputMode: 'numeric' }}
            />
          )}

          {/* Descripción */}
          <TextField
            label="Descripción"
            value={descCc}
            onChange={handleDescCcChange}
            fullWidth
            disabled={guardando}
            error={Boolean(errores.descCc)}
            helperText={errores.descCc || 'La descripción se guardará en mayúsculas.'}
          />

          {/* Tipo de centro de costo */}
          <FormControl
            fullWidth
            error={Boolean(errores.tipoCcId)}
            disabled={loadingMaestros || guardando}
          >
            <InputLabel>Tipo Centro de Costo</InputLabel>

            <Select
              value={tipoCcId}
              label="Tipo Centro de Costo"
              onChange={handleTipoCcChange}
            >
              <MenuItem value=""><em>Seleccione un tipo</em></MenuItem>

              {tiposCentroCosto.map((tipo) => (
                <MenuItem key={tipo.id_tip_cc} value={String(tipo.id_tip_cc)}>
                  {tipo.des_tip_cc}
                </MenuItem>
              ))}
            </Select>

            {errores.tipoCcId && <FormHelperText>{errores.tipoCcId}</FormHelperText>}
          </FormControl>

          {/* Tipo de maquinaria */}
          {mostrarTipoMaquinaria && (
            <FormControl
              fullWidth
              error={Boolean(errores.tipoMaqId)}
              disabled={loadingMaestros || guardando}
            >
              <InputLabel>Tipo Maquinaria</InputLabel>

              <Select
                value={tipoMaqId}
                label="Tipo Maquinaria"
                onChange={handleTipoMaqChange}
              >
                <MenuItem value=""><em>Seleccione</em></MenuItem>

                {tiposMaquinaria.map((tipo) => (
                  <MenuItem key={tipo.id_tipo_maq} value={String(tipo.id_tipo_maq)}>
                    {tipo.des_tipo_maquinaria}
                  </MenuItem>
                ))}
              </Select>

              {errores.tipoMaqId && <FormHelperText>{errores.tipoMaqId}</FormHelperText>}
            </FormControl>
          )}

          {/* Comparativo */}
          {mostrarComparativo && (
            <FormControl
              fullWidth
              disabled={loadingMaestros || guardando}
            >
              <InputLabel>Comparativo</InputLabel>

              <Select
                value={comparativoId}
                label="Comparativo"
                onChange={handleComparativoChange}
              >
                <MenuItem value=""><em>Sin asignar</em></MenuItem>

                {comparativos.map((comparativo) => (
                  <MenuItem key={comparativo.id_comparativo} value={String(comparativo.id_comparativo)}>
                    {comparativo.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Variedad */}
          {mostrarVariedad && (
            <FormControl
              fullWidth
              disabled={loadingMaestros || guardando}
            >
              <InputLabel>Variedad</InputLabel>

              <Select
                value={variedadId}
                label="Variedad"
                onChange={handleVariedadChange}
              >
                <MenuItem value=""><em>Sin asignar</em></MenuItem>

                {variedades.map((variedad) => (
                  <MenuItem key={variedad.id_variedad} value={String(variedad.id_variedad)}>
                    {variedad.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* VISTA PREVIA */}
          {descripcionPreview && (
            <Alert severity="info">
              <strong>Vista previa:</strong>{' '}
              {descripcionPreview}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={guardando}>Cancelar</Button>

        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={guardando || loadingMaestros}
        >
          {guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CentroCostoForm
