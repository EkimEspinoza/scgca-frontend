import { useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'

import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'

import {
  guardarUsuario,
  obtenerUsuarioPorId,
} from '../../services/usuarioService'


export default function UsuarioForm({
  open,
  usuarioEditar,
  permisos = [],
  empresas = [],
  onClose,
  onSaved,
}) {
  const modoEdicion = Boolean(usuarioEditar)

  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [idPermiso, setIdPermiso] = useState('')
  const [estado, setEstado] = useState('PENDIENTE')
  const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState([])

  const [error, setError] = useState('')

  const [notificacion, setNotificacion] = useState({
    open: false,
    mensaje: '',
    severity: 'success',
  })


  /*
   * Permiso seleccionado
   */
  const permisoSeleccionado = useMemo(() => {
    return permisos.find(
      (permiso) =>
        Number(permiso.id_permiso) ===
        Number(idPermiso),
    )
  }, [permisos, idPermiso])


  const esAdmin =
    permisoSeleccionado?.nombre === 'ADMIN'


  /*
   * Cargar información del usuario
   */
  useEffect(() => {
    if (!open) {
      return
    }

    if (!usuarioEditar) {
      setNombre('')
      setApellido('')
      setIdPermiso('')
      setEstado('PENDIENTE')
      setEmpresasSeleccionadas([])
      setError('')

      return
    }

    const cargarUsuario = async () => {
      try {
        setLoading(true)
        setError('')

        const usuario =
          await obtenerUsuarioPorId(
            usuarioEditar.id_usuario,
          )

        setNombre(usuario.nombre ?? '')
        setApellido(usuario.apellido ?? '')
        setIdPermiso(usuario.id_permiso ?? '')
        setEstado(usuario.estado ?? 'PENDIENTE')

        const idsEmpresas =
          (usuario.usuario_empresa ?? [])
            .filter(
              (item) => item.estado === true,
            )
            .map((item) =>
              Number(item.id_empresa),
            )

        const empresasActuales =
          empresas.filter((empresa) =>
            idsEmpresas.includes(
              Number(empresa.id_empresa),
            ),
          )

        setEmpresasSeleccionadas(
          empresasActuales,
        )
      } catch (err) {
        console.error(err)

        setError(
          err?.message ||
          'No se pudo cargar la información del usuario.',
        )
      } finally {
        setLoading(false)
      }
    }

    cargarUsuario()
  }, [
    open,
    usuarioEditar,
    empresas,
  ])


  /*
   * Cuando cambia a ADMIN,
   * quitar las empresas seleccionadas.
   */
  useEffect(() => {
    if (esAdmin) {
      setEmpresasSeleccionadas([])
    }
  }, [esAdmin])


  /*
   * Limpiar y cerrar
   */
  const handleCerrar = () => {
    if (guardando) {
      return
    }

    setError('')
    onClose()
  }


  /*
   * Guardar
   */
  const handleGuardar = async () => {
    setError('')

    /*
     * Validación nombre
     */
    if (!nombre.trim()) {
      setError(
        'El nombre del usuario es obligatorio.',
      )
      return
    }


    /*
     * Validación permiso
     */
    if (!idPermiso) {
      setError(
        'Debe seleccionar un permiso.',
      )
      return
    }


    /*
     * Validación empresas
     *
     * ADMIN no requiere empresas.
     */
    if (
      !esAdmin &&
      empresasSeleccionadas.length === 0
    ) {
      setError(
        'Debe asignar al menos una empresa al usuario.',
      )
      return
    }


    try {
      setGuardando(true)

      const idsEmpresas =
        esAdmin
          ? []
          : empresasSeleccionadas.map(
              (empresa) =>
                Number(empresa.id_empresa),
            )

      const usuarioGuardado =
        await guardarUsuario(
          usuarioEditar.id_usuario,
          {
            nombre,
            apellido,
            id_permiso: Number(idPermiso),
            estado,
          },
          idsEmpresas,
        )

      setNotificacion({
        open: true,
        mensaje:
          'Usuario actualizado correctamente.',
        severity: 'success',
      })

      /*
       * Avisar a Usuarios.jsx
       */
      if (onSaved) {
        onSaved(usuarioGuardado)
      }

      /*
       * Cerramos después de guardar.
       */
      onClose()
    } catch (err) {
      console.error(err)

      let mensaje =
        'No se pudo actualizar el usuario.'

      if (err?.code === '23503') {
        mensaje =
          'Existe una relación inválida con el permiso o la empresa.'
      }

      if (err?.code === '42501') {
        mensaje =
          'No tienes permisos para realizar esta operación.'
      }

      if (err?.code === '23505') {
        mensaje =
          'La asignación de empresa ya existe.'
      }

      setError(mensaje)
    } finally {
      setGuardando(false)
    }
  }


  return (
    <>
      <Dialog
        open={open}
        onClose={handleCerrar}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Editar usuario
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box
              sx={{
                minHeight: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={28} />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Cargando usuario...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                pt: 1,
              }}
            >
              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}


              {/* NOMBRE */}
              <TextField
                fullWidth
                label="Nombre"
                value={nombre}
                onChange={(event) =>
                  setNombre(event.target.value)
                }
                disabled={guardando}
                required
              />


              {/* APELLIDO */}
              <TextField
                fullWidth
                label="Apellido"
                value={apellido}
                onChange={(event) =>
                  setApellido(event.target.value)
                }
                disabled={guardando}
              />


              {/* CORREO / AUTH USER */}
              {usuarioEditar?.auth_user_id && (
                <TextField
                  fullWidth
                  label="Identificador de autenticación"
                  value={usuarioEditar.auth_user_id}
                  disabled
                  helperText="Este identificador no puede modificarse."
                />
              )}


              {/* PERMISO */}
              <FormControl
                fullWidth
                required
              >
                <InputLabel>
                  Permiso
                </InputLabel>

                <Select
                  value={idPermiso}
                  label="Permiso"
                  onChange={(event) =>
                    setIdPermiso(
                      event.target.value,
                    )
                  }
                  disabled={guardando}
                >
                  {permisos
                    .filter(
                      (permiso) =>
                        permiso.estado === true,
                    )
                    .map((permiso) => (
                      <MenuItem
                        key={permiso.id_permiso}
                        value={
                          permiso.id_permiso
                        }
                      >
                        {permiso.nombre}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>


              {/* EMPRESAS */}
              {!esAdmin && (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={empresas}
                  value={empresasSeleccionadas}
                  onChange={(_, nuevasEmpresas) =>
                    setEmpresasSeleccionadas(
                      nuevasEmpresas,
                    )
                  }
                  disabled={guardando}
                  getOptionLabel={(option) =>
                    option.nombre_comercial ??
                    ''
                  }
                  isOptionEqualToValue={(
                    option,
                    value,
                  ) =>
                    Number(
                      option.id_empresa,
                    ) ===
                    Number(
                      value.id_empresa,
                    )
                  }
                  renderTags={(
                    value,
                    getTagProps,
                  ) =>
                    value.map(
                      (option, index) => (
                        <Chip
                          label={
                            option.nombre_comercial
                          }
                          size="small"
                          {...getTagProps({
                            index,
                          })}
                          key={
                            option.id_empresa
                          }
                        />
                      ),
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Empresas"
                      placeholder={
                        empresasSeleccionadas.length ===
                        0
                          ? 'Seleccione empresas'
                          : ''
                      }
                      required
                    />
                  )}
                />
              )}


              {esAdmin && (
                <Alert severity="info">
                  El usuario ADMIN tiene acceso a
                  todas las empresas.
                </Alert>
              )}


              {/* ESTADO */}
              <FormControl fullWidth>
                <InputLabel>
                  Estado
                </InputLabel>

                <Select
                  value={estado}
                  label="Estado"
                  onChange={(event) =>
                    setEstado(
                      event.target.value,
                    )
                  }
                  disabled={guardando}
                >
                  <MenuItem value="ACTIVO">
                    ACTIVO
                  </MenuItem>

                  <MenuItem value="PENDIENTE">
                    PENDIENTE
                  </MenuItem>

                  <MenuItem value="INACTIVO">
                    INACTIVO
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>


        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseIcon />}
            onClick={handleCerrar}
            disabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={
              guardando ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleGuardar}
            disabled={
              loading ||
              guardando ||
              !modoEdicion
            }
          >
            {guardando
              ? 'Guardando...'
              : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>


      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={() =>
          setNotificacion((actual) => ({
            ...actual,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          severity={notificacion.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </>
  )
}