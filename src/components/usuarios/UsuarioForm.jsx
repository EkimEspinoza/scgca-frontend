import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import {
  Business as BusinessIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material'


function UsuarioForm({
  open,
  usuario,
  permisos = [],
  empresas = [],
  guardando = false,
  onClose,
  onSave,
}) {
  const esEdicion = Boolean(usuario)

  const [formulario, setFormulario] = useState({
    email: '',
    nombre: '',
    apellido: '',
    id_permiso: '',
    estado: 'PENDIENTE',
    empresas: [],
  })

  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (!open) {
      return
    }

    // Reinitialize the draft whenever the dialog opens or its target user changes.
    // eslint-disable-next-line react/set-state-in-effect
    if (usuario) {
      const empresasAsignadas = (
        usuario.usuario_empresa ?? []
      )
        .filter(
          (empresa) =>
            empresa.estado === true,
        )
        .map(
          (empresa) =>
            Number(empresa.id_empresa),
        )

      // eslint-disable-next-line react/set-state-in-effect
      setFormulario({
        email: usuario.email ?? '',
        nombre: usuario.nombre ?? '',
        apellido: usuario.apellido ?? '',
        id_permiso:
          usuario.id_permiso
            ? String(
                usuario.id_permiso,
              )
            : '',
        estado:
          usuario.estado ??
          'PENDIENTE',
        empresas:
          empresasAsignadas,
      })
    } else {
      setFormulario({
        email: '',
        nombre: '',
        apellido: '',
        id_permiso: '',
        estado: 'PENDIENTE',
        empresas: [],
      })
    }

    setErrores({})
  }, [
    open,
    usuario,
  ])


  const permisoSeleccionado =
    useMemo(() => {
      return permisos.find(
        (permiso) =>
          Number(
            permiso.id_permiso,
          ) ===
          Number(
            formulario.id_permiso,
          ),
      )
    }, [
      permisos,
      formulario.id_permiso,
    ])


  const esAdmin =
    permisoSeleccionado?.nombre ===
    'ADMIN'


  const manejarCambio = (
    campo,
    valor,
  ) => {
    setFormulario(
      (prev) => ({
        ...prev,
        [campo]: valor,
      }),
    )

    if (errores[campo]) {
      setErrores(
        (prev) => ({
          ...prev,
          [campo]: '',
        }),
      )
    }
  }


  const manejarPermiso = (
    event,
  ) => {
    const valor =
      event.target.value

    const permiso =
      permisos.find(
        (item) =>
          Number(
            item.id_permiso,
          ) ===
          Number(valor),
      )

    const nuevoEsAdmin =
      permiso?.nombre ===
      'ADMIN'

    setFormulario(
      (prev) => ({
        ...prev,
        id_permiso: valor,
        empresas: nuevoEsAdmin
          ? []
          : prev.empresas,
      }),
    )

    if (errores.id_permiso) {
      setErrores(
        (prev) => ({
          ...prev,
          id_permiso: '',
        }),
      )
    }
  }


  const validar = () => {
    const nuevosErrores = {}

    /*
     * =====================================================
     * EMAIL
     * =====================================================
     *
     * El email es obligatorio únicamente
     * al crear un usuario.
     *
     * En edición no se modifica.
     */
    if (!esEdicion) {
      const email =
        formulario.email.trim()

      if (!email) {
        nuevosErrores.email =
          'Ingresa el correo electrónico.'
      } else {
        const emailValido =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailValido.test(email)) {
          nuevosErrores.email =
            'Ingresa un correo electrónico válido.'
        }
      }
    }


    /*
     * =====================================================
     * NOMBRE
     * =====================================================
     */
    if (
      !formulario.nombre.trim()
    ) {
      nuevosErrores.nombre =
        'Ingresa el nombre.'
    }


    /*
     * =====================================================
     * PERMISO
     * =====================================================
     */
    if (
      !formulario.id_permiso
    ) {
      nuevosErrores.id_permiso =
        'Selecciona un permiso.'
    }


    /*
     * =====================================================
     * EMPRESAS
     * =====================================================
     */
    if (
      !esAdmin &&
      formulario.empresas.length ===
        0
    ) {
      nuevosErrores.empresas =
        'Selecciona al menos una empresa.'
    }


    setErrores(nuevosErrores)

    return (
      Object.keys(
        nuevosErrores,
      ).length === 0
    )
  }


  const manejarGuardar = async () => {
    if (!validar()) {
      return
    }

    await onSave({
      ...(esEdicion
        ? {}
        : {
            email:
              formulario.email
                .trim()
                .toLowerCase(),
          }),

      nombre:
        formulario.nombre.trim(),

      apellido:
        formulario.apellido.trim(),

      id_permiso:
        Number(
          formulario.id_permiso,
        ),

      estado:
        formulario.estado,

      empresas:
        esAdmin
          ? []
          : formulario.empresas,
    })
  }


  const renderEmpresas = () => {
    if (esAdmin) {
      return (
        <Alert
          severity="info"
          icon={<BusinessIcon />}
          sx={{
            borderRadius: 1,
          }}
        >
          <Typography
            variant="body2"
          >
            Los usuarios con permiso
            <strong> ADMIN </strong>
            tienen acceso a todas las
            empresas. No es necesario
            asignarlas individualmente.
          </Typography>
        </Alert>
      )
    }

    return (
      <FormControl
        fullWidth
        error={Boolean(
          errores.empresas,
        )}
      >
        <InputLabel>
          Empresas asignadas
        </InputLabel>

        <Select
          multiple
          value={
            formulario.empresas
          }
          onChange={(event) => {
            manejarCambio(
              'empresas',
              event.target.value.map(
                (value) =>
                  Number(value),
              ),
            )
          }}
          input={
            <OutlinedInput
              label="Empresas asignadas"
            />
          }
          renderValue={(
            seleccionadas,
          ) => (
            <Box
              sx={{
                display: 'flex',
                flexWrap:
                  'wrap',
                gap: 0.5,
              }}
            >
              {seleccionadas.map(
                (idEmpresa) => {
                  const empresa =
                    empresas.find(
                      (item) =>
                        Number(
                          item.id_empresa,
                        ) ===
                        Number(
                          idEmpresa,
                        ),
                    )

                  return (
                    <Chip
                      key={
                        idEmpresa
                      }
                      label={
                        empresa?.nombre_comercial ??
                        idEmpresa
                      }
                      size="small"
                    />
                  )
                },
              )}
            </Box>
          )}
          sx={{
            minHeight: 42,
            borderRadius: 1,
          }}
        >
          {empresas.map(
            (empresa) => (
              <MenuItem
                key={
                  empresa.id_empresa
                }
                value={
                  empresa.id_empresa
                }
              >
                <Checkbox
                  checked={formulario.empresas.includes(
                    Number(
                      empresa.id_empresa,
                    ),
                  )}
                  size="small"
                />

                <Typography
                  variant="body2"
                >
                  {
                    empresa.nombre_comercial
                  }
                </Typography>
              </MenuItem>
            ),
          )}
        </Select>

        <FormHelperText>
          {errores.empresas ||
            'Selecciona las empresas a las que tendrá acceso el usuario.'}
        </FormHelperText>
      </FormControl>
    )
  }


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
      PaperProps={{
        sx: {
          borderRadius: 1.5,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            {esEdicion
              ? 'Editar usuario'
              : 'Nuevo usuario'}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
            }}
          >
            {esEdicion
              ? 'Actualiza los datos, permisos y empresas asignadas.'
              : 'Completa los datos del usuario.'}
          </Typography>
        </Box>

        <Button
          onClick={onClose}
          disabled={guardando}
          color="inherit"
          sx={{
            minWidth: 36,
            width: 36,
            height: 36,
            borderRadius: 1,
            p: 0,
          }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
        }}
      >
        <Stack spacing={2}>

          {esEdicion &&
            usuario?.auth_user_id && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                >
                  La cuenta de acceso está
                  administrada por
                  <strong>
                    {' '}
                    Supabase Auth
                  </strong>
                  . Desde aquí se administra
                  el perfil, permiso, estado y
                  empresas.
                </Typography>
              </Alert>
            )}


          {/* =================================================
              DATOS DEL USUARIO
          ================================================= */}

          {!esEdicion && (
            <TextField
              label="Correo electrónico"
              value={
                formulario.email
              }
              onChange={(event) =>
                manejarCambio(
                  'email',
                  event.target.value,
                )
              }
              error={Boolean(
                errores.email,
              )}
              helperText={
                errores.email ||
                'Se enviará una invitación a este correo.'
              }
              fullWidth
              size="small"
              type="email"
              autoComplete="email"
              disabled={guardando}
            />
          )}


          {esEdicion &&
            usuario?.auth_user_id && (
              <TextField
                label="Correo electrónico"
                value={
                  usuario.email ??
                  ''
                }
                fullWidth
                size="small"
                disabled
                helperText="El correo se administra desde Supabase Auth."
              />
            )}


          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            <TextField
              label="Nombre"
              value={
                formulario.nombre
              }
              onChange={(event) =>
                manejarCambio(
                  'nombre',
                  event.target.value,
                )
              }
              error={Boolean(
                errores.nombre,
              )}
              helperText={
                errores.nombre
              }
              fullWidth
              size="small"
              disabled={guardando}
            />

            <TextField
              label="Apellido"
              value={
                formulario.apellido
              }
              onChange={(event) =>
                manejarCambio(
                  'apellido',
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              disabled={guardando}
            />
          </Box>


          {/* =================================================
              PERMISO / ESTADO
          ================================================= */}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            <FormControl
              fullWidth
              size="small"
              error={Boolean(
                errores.id_permiso,
              )}
              disabled={guardando}
            >
              <InputLabel>
                Permiso
              </InputLabel>

              <Select
                value={
                  formulario.id_permiso
                }
                label="Permiso"
                onChange={
                  manejarPermiso
                }
              >
                {permisos.map(
                  (permiso) => (
                    <MenuItem
                      key={
                        permiso.id_permiso
                      }
                      value={
                        permiso.id_permiso
                      }
                    >
                      {
                        permiso.nombre
                      }
                    </MenuItem>
                  ),
                )}
              </Select>

              <FormHelperText>
                {errores.id_permiso}
              </FormHelperText>
            </FormControl>


            <FormControl
              fullWidth
              size="small"
              disabled={guardando}
            >
              <InputLabel>
                Estado
              </InputLabel>

              <Select
                value={
                  formulario.estado
                }
                label="Estado"
                onChange={(event) =>
                  manejarCambio(
                    'estado',
                    event.target.value,
                  )
                }
              >
                <MenuItem value="ACTIVO">
                  Activo
                </MenuItem>

                <MenuItem value="PENDIENTE">
                  Pendiente
                </MenuItem>

                <MenuItem value="INACTIVO">
                  Inactivo
                </MenuItem>
              </Select>
            </FormControl>
          </Box>


          {/* =================================================
              EMPRESAS
          ================================================= */}

          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{
                mb: 1,
              }}
            >
              Acceso a empresas
            </Typography>

            {renderEmpresas()}
          </Box>

        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={guardando}
          variant="outlined"
          color="inherit"
          sx={{
            height: 40,
            minWidth: 110,
            borderRadius: 1,
          }}
        >
          Cancelar
        </Button>

        <Button
          onClick={manejarGuardar}
          variant="contained"
          disabled={guardando}
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
          sx={{
            height: 40,
            minWidth: 140,
            borderRadius: 1,
          }}
        >
          {guardando
            ? 'Guardando...'
            : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}


export default UsuarioForm