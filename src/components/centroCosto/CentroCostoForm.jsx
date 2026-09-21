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

import {
  crearCentroCosto,
  actualizarCentroCosto,
} from '../../services/centroCostoService'

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
  /*
   * =========================================================
   * ESTADOS DEL FORMULARIO
   * =========================================================
   */
  const [empresaId, setEmpresaId] = useState('')
  const [codCc, setCodCc] = useState('')
  const [descCc, setDescCc] = useState('')
  const [tipoCcId, setTipoCcId] = useState('')
  const [tipoMaqId, setTipoMaqId] = useState('')
  const [comparativoId, setComparativoId] = useState('')
  const [variedadId, setVariedadId] = useState('')
  const [estado, setEstado] = useState('true')

  /*
   * =========================================================
   * CONTROL
   * =========================================================
   */
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState('')

  /*
   * =========================================================
   * REGLAS
   * =========================================================
   */
  const TIPO_MAQUINARIAS = 3
  const TIPO_LEVANTE = 4
  const TIPO_INVERSION_CAMPO = 15
  const TIPO_VIVEROS = 16

  /*
   * =========================================================
   * MODO
   * =========================================================
   */
  const modoEdicion = Boolean(
    centroCostoEditar,
  )

  /*
   * =========================================================
   * DESCRIPCIÓN BASE
   *
   * En BD:
   *
   * DESCRIPCIÓN (15101)
   *
   * Al editar eliminamos el sufijo
   * para no generar:
   *
   * DESCRIPCIÓN (15101) (15101)
   * =========================================================
   */
  const obtenerDescripcionBase = (
    descripcion,
    codigo,
  ) => {
    if (!descripcion) {
      return ''
    }

    const texto = String(descripcion)

    if (
      codigo === null ||
      codigo === undefined
    ) {
      return texto
    }

    const sufijo = ` (${codigo})`

    if (
      texto
        .toUpperCase()
        .endsWith(
          sufijo.toUpperCase(),
        )
    ) {
      return texto.slice(
        0,
        texto.length -
          sufijo.length,
      )
    }

    return texto
  }

  /*
   * =========================================================
   * CARGAR DATOS DEL FORMULARIO
   * =========================================================
   */
  useEffect(() => {
    if (!open) {
      return
    }

    setErrores({})
    setErrorGuardar('')

    /*
     * =======================================================
     * MODO EDITAR
     * =======================================================
     */
    if (centroCostoEditar) {
      const codigo =
        centroCostoEditar.cod_cc

      /*
       * Empresa:
       * se conserva internamente.
       */
      setEmpresaId(
        centroCostoEditar.id_empresa !=
          null
          ? String(
              centroCostoEditar.id_empresa,
            )
          : '',
      )

      /*
       * Código:
       * se conserva internamente,
       * pero NO se muestra.
       */
      setCodCc(
        codigo != null
          ? String(codigo)
          : '',
      )

      /*
       * Descripción:
       * eliminamos " (CODIGO)".
       */
      setDescCc(
        obtenerDescripcionBase(
          centroCostoEditar.desc_cc,
          codigo,
        ),
      )

      setTipoCcId(
        centroCostoEditar.id_tip_cc !=
          null
          ? String(
              centroCostoEditar.id_tip_cc,
            )
          : '',
      )

      setTipoMaqId(
        centroCostoEditar.id_tipo_maq !=
          null
          ? String(
              centroCostoEditar.id_tipo_maq,
            )
          : '',
      )

      setComparativoId(
        centroCostoEditar.id_comparativo !=
          null
          ? String(
              centroCostoEditar.id_comparativo,
            )
          : '',
      )

      setVariedadId(
        centroCostoEditar.id_variedad !=
          null
          ? String(
              centroCostoEditar.id_variedad,
            )
          : '',
      )

      setEstado(
        centroCostoEditar.estado === true
          ? 'true'
          : 'false',
      )

      return
    }

    /*
     * =======================================================
     * MODO NUEVO
     * =======================================================
     */
    setEmpresaId('')
    setCodCc('')
    setDescCc('')
    setTipoCcId('')
    setTipoMaqId('')
    setComparativoId('')
    setVariedadId('')
    setEstado('true')
  }, [
    open,
    centroCostoEditar,
  ])

  /*
   * =========================================================
   * VISIBILIDAD DE CAMPOS DEPENDIENTES
   * =========================================================
   */
  const mostrarTipoMaquinaria =
    Number(tipoCcId) ===
    TIPO_MAQUINARIAS

  const mostrarComparativo =
    Number(tipoCcId) ===
      TIPO_LEVANTE ||
    Number(tipoCcId) ===
      TIPO_INVERSION_CAMPO

  const mostrarVariedad =
    Number(tipoCcId) ===
      TIPO_LEVANTE ||
    Number(tipoCcId) ===
      TIPO_INVERSION_CAMPO ||
    Number(tipoCcId) ===
      TIPO_VIVEROS

  /*
   * =========================================================
   * EMPRESA
   * =========================================================
   */
  const handleEmpresaChange = (
    event,
  ) => {
    setEmpresaId(
      event.target.value,
    )

    setErrores((prev) => ({
      ...prev,
      empresaId: '',
    }))
  }

  /*
   * =========================================================
   * CÓDIGO
   *
   * Solo se utiliza para NUEVOS registros.
   * =========================================================
   */
  const handleCodCcChange = (
    event,
  ) => {
    const valor =
      event.target.value.replace(
        /\D/g,
        '',
      )

    setCodCc(valor)

    setErrores((prev) => ({
      ...prev,
      codCc: '',
    }))
  }

  /*
   * =========================================================
   * DESCRIPCIÓN
   * =========================================================
   */
  const handleDescCcChange = (
    event,
  ) => {
    setDescCc(
      event.target.value.toUpperCase(),
    )

    setErrores((prev) => ({
      ...prev,
      descCc: '',
    }))
  }

  /*
   * =========================================================
   * TIPO CENTRO DE COSTO
   * =========================================================
   */
  const handleTipoCcChange = (
    event,
  ) => {
    const nuevoTipo =
      event.target.value

    setTipoCcId(nuevoTipo)

    /*
     * Limpiamos campos dependientes.
     */
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

  /*
   * =========================================================
   * TIPO MAQUINARIA
   * =========================================================
   */
  const handleTipoMaqChange = (
    event,
  ) => {
    setTipoMaqId(
      event.target.value,
    )

    setErrores((prev) => ({
      ...prev,
      tipoMaqId: '',
    }))
  }

  /*
   * =========================================================
   * COMPARATIVO
   * =========================================================
   */
  const handleComparativoChange = (
    event,
  ) => {
    setComparativoId(
      event.target.value,
    )

    setErrores((prev) => ({
      ...prev,
      comparativoId: '',
    }))
  }

  /*
   * =========================================================
   * VARIEDAD
   * =========================================================
   */
  const handleVariedadChange = (
    event,
  ) => {
    setVariedadId(
      event.target.value,
    )

    setErrores((prev) => ({
      ...prev,
      variedadId: '',
    }))
  }

  /*
   * =========================================================
   * ESTADO
   * =========================================================
   */
  const handleEstadoChange = (
    event,
  ) => {
    setEstado(
      event.target.value,
    )
  }

  /*
   * =========================================================
   * VALIDAR FORMULARIO
   * =========================================================
   */
  const validarFormulario = () => {
    const nuevosErrores = {}

    /*
     * Empresa siempre debe existir.
     */
    if (!empresaId) {
      nuevosErrores.empresaId =
        'Seleccione una empresa.'
    }

    /*
     * Código solo es obligatorio
     * cuando se crea.
     */
    if (!modoEdicion && !codCc) {
      nuevosErrores.codCc =
        'Ingrese el código del Centro de Costo.'
    }

    /*
     * Descripción obligatoria.
     */
    if (!descCc.trim()) {
      nuevosErrores.descCc =
        'Ingrese la descripción del Centro de Costo.'
    }

    /*
     * Tipo CC obligatorio.
     */
    if (!tipoCcId) {
      nuevosErrores.tipoCcId =
        'Seleccione el Tipo de Centro de Costo.'
    }

    /*
     * Tipo 3:
     * Tipo Maquinaria obligatorio.
     */
    if (
      Number(tipoCcId) ===
        TIPO_MAQUINARIAS &&
      !tipoMaqId
    ) {
      nuevosErrores.tipoMaqId =
        'Seleccione el Tipo de Maquinaria.'
    }

    setErrores(
      nuevosErrores,
    )

    return (
      Object.keys(
        nuevosErrores,
      ).length === 0
    )
  }

  /*
   * =========================================================
   * GUARDAR
   * =========================================================
   */
  const handleGuardar = async () => {
    setErrorGuardar('')

    if (!validarFormulario()) {
      return
    }

    try {
      setGuardando(true)

      /*
       * =====================================================
       * EDITAR
       * =====================================================
       */
      if (modoEdicion) {
        /*
         * Validamos que tengamos
         * el identificador original.
         */
        if (
          !centroCostoEditar?.cod_cc_pk
        ) {
          throw new Error(
            'No se encontró el identificador del Centro de Costo.',
          )
        }

        const registro =
          await actualizarCentroCosto({
            /*
             * Identificador original.
             * NO cambia.
             */
            codCcPk:
              centroCostoEditar.cod_cc_pk,

            /*
             * Código original.
             * NO cambia.
             */
            codCc:
              centroCostoEditar.cod_cc,

            /*
             * Campos modificables.
             */
            descripcionBase:
              descCc.trim(),

            id_tip_cc:
              tipoCcId,

            id_tipo_maq:
              tipoMaqId || null,

            id_comparativo:
              comparativoId || null,

            id_variedad:
              variedadId || null,

            estado:
              estado === 'true',
          })

        /*
         * Informamos a CentroCostos.jsx
         * que el registro fue actualizado.
         */
        if (onSaved) {
  onSaved(registro, true)
}

        onClose()

        return
      }

      /*
       * =====================================================
       * NUEVO
       * =====================================================
       */
      const registro =
        await crearCentroCosto({
          id_empresa:
            empresaId,

          cod_cc:
            codCc,

          descripcionBase:
            descCc.trim(),

          id_tip_cc:
            tipoCcId,

          id_tipo_maq:
            tipoMaqId || null,

          id_comparativo:
            comparativoId || null,

          id_variedad:
            variedadId || null,

          estado:
            estado === 'true',
        })

      /*
       * Informamos a CentroCostos.jsx.
       */
      if (onSaved) {
        onSaved(registro)
      }

      onClose()
    } catch (error) {
      console.error(
        'Error guardando Centro de Costo:',
        error,
      )

      /*
       * Código duplicado.
       */
      if (
        error?.code === '23505'
      ) {
        setErrorGuardar(
          'El código del Centro de Costo ya existe para esta empresa.',
        )
        return
      }

      /*
       * Foreign Key.
       */
      if (
        error?.code === '23503'
      ) {
        setErrorGuardar(
          'Uno de los valores seleccionados no existe en los maestros.',
        )
        return
      }

      /*
       * RLS.
       */
      if (
        error?.code === '42501'
      ) {
        setErrorGuardar(
          modoEdicion
            ? 'No tienes permisos para modificar este Centro de Costo.'
            : 'No tienes permisos para registrar este Centro de Costo.',
        )
        return
      }

      setErrorGuardar(
        error?.message ||
          (
            modoEdicion
              ? 'No se pudo actualizar el Centro de Costo.'
              : 'No se pudo registrar el Centro de Costo.'
          ),
      )
    } finally {
      setGuardando(false)
    }
  }

  /*
   * =========================================================
   * PREVIEW
   * =========================================================
   */
  const descripcionPreview =
    descCc.trim() && codCc
      ? `${descCc.trim()} (${codCc})`
      : ''

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */
  return (
    <Dialog
      open={open}
      onClose={
        guardando
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {modoEdicion
          ? 'Editar Centro de Costo'
          : 'Nuevo Centro de Costo'}
      </DialogTitle>

      <DialogContent>
        <Stack
          spacing={2}
          sx={{
            mt: 1,
          }}
        >
          {errorGuardar && (
            <Alert severity="error">
              {errorGuardar}
            </Alert>
          )}

          {/* =================================================
              EMPRESA
          ================================================== */}
          <FormControl
            fullWidth
            error={Boolean(
              errores.empresaId,
            )}
            disabled={
              loadingMaestros ||
              guardando ||
              modoEdicion
            }
          >
            <InputLabel>
              Empresa
            </InputLabel>

            <Select
              value={empresaId}
              label="Empresa"
              onChange={
                handleEmpresaChange
              }
            >
              <MenuItem value="">
                <em>
                  Seleccione una empresa
                </em>
              </MenuItem>

              {empresas.map(
                (empresa) => (
                  <MenuItem
                    key={
                      empresa.id_empresa
                    }
                    value={String(
                      empresa.id_empresa,
                    )}
                  >
                    {
                      empresa.nombre_comercial
                    }
                  </MenuItem>
                ),
              )}
            </Select>

            {errores.empresaId && (
              <FormHelperText>
                {
                  errores.empresaId
                }
              </FormHelperText>
            )}
          </FormControl>

          {/* =================================================
              CÓDIGO
              
              SOLO PARA NUEVO
          ================================================== */}
          {!modoEdicion && (
            <TextField
              label="Código Centro de Costo"
              value={codCc}
              onChange={
                handleCodCcChange
              }
              fullWidth
              disabled={guardando}
              error={Boolean(
                errores.codCc,
              )}
              helperText={
                errores.codCc ||
                'Solo se permiten números.'
              }
              inputProps={{
                inputMode: 'numeric',
              }}
            />
          )}

          {/* =================================================
              DESCRIPCIÓN
          ================================================== */}
          <TextField
            label="Descripción"
            value={descCc}
            onChange={
              handleDescCcChange
            }
            fullWidth
            disabled={guardando}
            error={Boolean(
              errores.descCc,
            )}
            helperText={
              errores.descCc ||
              'La descripción se guardará en mayúsculas.'
            }
          />

          {/* =================================================
              TIPO CENTRO DE COSTO
          ================================================== */}
          <FormControl
            fullWidth
            error={Boolean(
              errores.tipoCcId,
            )}
            disabled={
              loadingMaestros ||
              guardando
            }
          >
            <InputLabel>
              Tipo Centro de Costo
            </InputLabel>

            <Select
              value={tipoCcId}
              label="Tipo Centro de Costo"
              onChange={
                handleTipoCcChange
              }
            >
              <MenuItem value="">
                <em>
                  Seleccione un tipo
                </em>
              </MenuItem>

              {tiposCentroCosto.map(
                (tipo) => (
                  <MenuItem
                    key={
                      tipo.id_tip_cc
                    }
                    value={String(
                      tipo.id_tip_cc,
                    )}
                  >
                    {
                      tipo.des_tip_cc
                    }
                  </MenuItem>
                ),
              )}
            </Select>

            {errores.tipoCcId && (
              <FormHelperText>
                {
                  errores.tipoCcId
                }
              </FormHelperText>
            )}
          </FormControl>

          {/* =================================================
              TIPO MAQUINARIA
          ================================================== */}
          {mostrarTipoMaquinaria && (
            <FormControl
              fullWidth
              error={Boolean(
                errores.tipoMaqId,
              )}
              disabled={
                loadingMaestros ||
                guardando
              }
            >
              <InputLabel>
                Tipo Maquinaria
              </InputLabel>

              <Select
                value={tipoMaqId}
                label="Tipo Maquinaria"
                onChange={
                  handleTipoMaqChange
                }
              >
                <MenuItem value="">
                  <em>
                    Seleccione
                  </em>
                </MenuItem>

                {tiposMaquinaria.map(
                  (tipo) => (
                    <MenuItem
                      key={
                        tipo.id_tipo_maq
                      }
                      value={String(
                        tipo.id_tipo_maq,
                      )}
                    >
                      {
                        tipo.des_tipo_maquinaria
                      }
                    </MenuItem>
                  ),
                )}
              </Select>

              {errores.tipoMaqId && (
                <FormHelperText>
                  {
                    errores.tipoMaqId
                  }
                </FormHelperText>
              )}
            </FormControl>
          )}

          {/* =================================================
              COMPARATIVO
          ================================================== */}
          {mostrarComparativo && (
            <FormControl
              fullWidth
              disabled={
                loadingMaestros ||
                guardando
              }
            >
              <InputLabel>
                Comparativo
              </InputLabel>

              <Select
                value={
                  comparativoId
                }
                label="Comparativo"
                onChange={
                  handleComparativoChange
                }
              >
                <MenuItem value="">
                  <em>
                    Sin asignar
                  </em>
                </MenuItem>

                {comparativos.map(
                  (comparativo) => (
                    <MenuItem
                      key={
                        comparativo.id_comparativo
                      }
                      value={String(
                        comparativo.id_comparativo,
                      )}
                    >
                      {
                        comparativo.descripcion
                      }
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          )}

          {/* =================================================
              VARIEDAD
          ================================================== */}
          {mostrarVariedad && (
            <FormControl
              fullWidth
              disabled={
                loadingMaestros ||
                guardando
              }
            >
              <InputLabel>
                Variedad
              </InputLabel>

              <Select
                value={variedadId}
                label="Variedad"
                onChange={
                  handleVariedadChange
                }
              >
                <MenuItem value="">
                  <em>
                    Sin asignar
                  </em>
                </MenuItem>

                {variedades.map(
                  (variedad) => (
                    <MenuItem
                      key={
                        variedad.id_variedad
                      }
                      value={String(
                        variedad.id_variedad,
                      )}
                    >
                      {
                        variedad.descripcion
                      }
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          )}

          {/* =================================================
              ESTADO
          ================================================== */}
          <FormControl
            fullWidth
            disabled={guardando}
          >
            <InputLabel>
              Estado
            </InputLabel>

            <Select
              value={estado}
              label="Estado"
              onChange={
                handleEstadoChange
              }
            >
              <MenuItem value="true">
                ACTIVO
              </MenuItem>

              <MenuItem value="false">
                INACTIVO
              </MenuItem>
            </Select>
          </FormControl>

          {/* =================================================
              PREVIEW
          ================================================== */}
          {descripcionPreview && (
            <Alert severity="info">
              <strong>
                Vista previa:
              </strong>{' '}
              {descripcionPreview}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
        }}
      >
        <Button
          onClick={onClose}
          disabled={guardando}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={
            guardando ||
            loadingMaestros
          }
        >
          {guardando
            ? 'Guardando...'
            : modoEdicion
              ? 'Guardar cambios'
              : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CentroCostoForm