import {
  useEffect,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'

import {
  ArrowBack as ArrowBackIcon,
  LockOutlined as LockOutlinedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'

import {
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabase'


function CambiarContrasena() {
  const navigate = useNavigate()

  useAuth()


  const [
    cargando,
    setCargando,
  ] = useState(true)

  const [
    guardando,
    setGuardando,
  ] = useState(false)

  const [
    contrasena,
    setContrasena,
  ] = useState('')

  const [
    confirmarContrasena,
    setConfirmarContrasena,
  ] = useState('')

  const [
    mostrarContrasena,
    setMostrarContrasena,
  ] = useState(false)

  const [
    mostrarConfirmacion,
    setMostrarConfirmacion,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    exito,
    setExito,
  ] = useState(false)


  /*
   * =========================================
   * VERIFICAR SESIÓN
   * =========================================
   */
  useEffect(() => {
    const verificarSesion =
      async () => {
        try {
          const {
            data,
            error: errorSesion,
          } =
            await supabase.auth.getSession()


          if (errorSesion) {
            setError(
              'No se pudo verificar la sesión.',
            )

            return
          }


          if (!data.session) {
            setError(
              'No existe una sesión activa. Inicia sesión para cambiar tu contraseña.',
            )

            return
          }

        } catch (err) {
          console.error(
            'Error verificando sesión:',
            err,
          )

          setError(
            'No se pudo verificar la sesión.',
          )
        } finally {
          setCargando(false)
        }
      }


    verificarSesion()
  }, [])


  /*
   * =========================================
   * CAMBIAR CONTRASEÑA
   * =========================================
   */
  const handleGuardar = async (
    event,
  ) => {
    event.preventDefault()

    setError('')
    setExito(false)


    if (!contrasena) {
      setError(
        'Ingresa una contraseña.',
      )

      return
    }


    if (contrasena.length < 8) {
      setError(
        'La contraseña debe tener al menos 8 caracteres.',
      )

      return
    }


    if (!confirmarContrasena) {
      setError(
        'Confirma tu contraseña.',
      )

      return
    }


    if (
      contrasena !==
      confirmarContrasena
    ) {
      setError(
        'Las contraseñas no coinciden.',
      )

      return
    }


    try {
      setGuardando(true)


      const {
        error: errorActualizar,
      } =
        await supabase.auth.updateUser(
          {
            password:
              contrasena,
          },
        )


      if (errorActualizar) {
        throw errorActualizar
      }


      setExito(true)

      setContrasena('')
      setConfirmarContrasena('')


      setTimeout(() => {
        navigate(
          '/dashboard',
          {
            replace: true,
          },
        )
      }, 1500)

    } catch (err) {
      console.error(
        'Error cambiando contraseña:',
        err,
      )

      setError(
        err?.message ||
          'No se pudo cambiar la contraseña.',
      )
    } finally {
      setGuardando(false)
    }
  }


  /*
   * =========================================
   * VOLVER
   * =========================================
   */
  const handleVolverDashboard =
    () => {
      navigate('/dashboard')
    }


  /*
   * =========================================
   * CARGANDO
   * =========================================
   */
  if (cargando) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            'background.default',
        }}
      >
        <CircularProgress
          color="primary"
        />
      </Box>
    )
  }


  /*
   * =========================================
   * PANTALLA
   * =========================================
   */
  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor:
          'background.default',

        py: {
          xs: 3,
          sm: 4,
        },

        px: {
          xs: 2,
          sm: 3,
        },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >

        <Card
          elevation={0}
          sx={{
            width: '100%',

            border:
              '1px solid',

            borderColor:
              'divider',

            borderRadius: 3,

            boxShadow:
              '0 4px 18px rgba(0, 0, 0, 0.06)',
          }}
        >

          <CardContent
            sx={{
              p: {
                xs: 3,
                sm: 4,
              },

              '&:last-child': {
                pb: {
                  xs: 3,
                  sm: 4,
                },
              },
            }}
          >

            {/* =========================================
                ICONO PRINCIPAL
            ========================================== */}

            <Box
              sx={{
                width: 68,
                height: 68,

                mx: 'auto',
                mb: 2,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                borderRadius: '50%',

                backgroundColor:
                  'rgba(46, 125, 50, 0.10)',

                color:
                  'primary.main',
              }}
            >
              <LockOutlinedIcon
                sx={{
                  fontSize: 34,
                }}
              />
            </Box>


            {/* =========================================
                TÍTULO
            ========================================== */}

            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 700,
                color:
                  'text.primary',
                mb: 1,
              }}
            >
              Cambiar contraseña
            </Typography>


            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Actualiza tu contraseña
              para mantener segura tu
              cuenta de Costos Rotondo.
            </Typography>


            {/* =========================================
                ERROR
            ========================================== */}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: 1.5,
                }}
              >
                {error}
              </Alert>
            )}


            {/* =========================================
                ÉXITO
            ========================================== */}

            {exito && (
              <Alert
                severity="success"
                sx={{
                  mb: 2.5,
                  borderRadius: 1.5,
                }}
              >
                Tu contraseña se cambió
                correctamente. Regresando
                al Dashboard...
              </Alert>
            )}


            {/* =========================================
                FORMULARIO
            ========================================== */}

            <Box
              component="form"
              onSubmit={
                handleGuardar
              }
            >

              {/* =========================================
                  NUEVA CONTRASEÑA
              ========================================== */}

              <TextField
                fullWidth
                label="Nueva contraseña"
                type={
                  mostrarContrasena
                    ? 'text'
                    : 'password'
                }
                value={contrasena}
                onChange={(event) =>
                  setContrasena(
                    event.target.value,
                  )
                }
                disabled={guardando}
                autoComplete="new-password"
                helperText="Mínimo 8 caracteres"
                sx={{
                  mb: 2.5,
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() =>
                            setMostrarContrasena(
                              (
                                anterior,
                              ) =>
                                !anterior,
                            )
                          }
                          edge="end"
                          disabled={
                            guardando
                          }
                          aria-label={
                            mostrarContrasena
                              ? 'Ocultar contraseña'
                              : 'Mostrar contraseña'
                          }
                          sx={{
                            color:
                              'text.secondary',

                            '&:hover': {
                              color:
                                'primary.main',
                              backgroundColor:
                                'rgba(46, 125, 50, 0.08)',
                            },
                          }}
                        >
                          {mostrarContrasena ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />


              {/* =========================================
                  CONFIRMAR CONTRASEÑA
              ========================================== */}

              <TextField
                fullWidth
                label="Confirmar contraseña"
                type={
                  mostrarConfirmacion
                    ? 'text'
                    : 'password'
                }
                value={
                  confirmarContrasena
                }
                onChange={(event) =>
                  setConfirmarContrasena(
                    event.target.value,
                  )
                }
                disabled={guardando}
                autoComplete="new-password"
                sx={{
                  mb: 3,
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() =>
                            setMostrarConfirmacion(
                              (
                                anterior,
                              ) =>
                                !anterior,
                            )
                          }
                          edge="end"
                          disabled={
                            guardando
                          }
                          aria-label={
                            mostrarConfirmacion
                              ? 'Ocultar confirmación'
                              : 'Mostrar confirmación'
                          }
                          sx={{
                            color:
                              'text.secondary',

                            '&:hover': {
                              color:
                                'primary.main',
                              backgroundColor:
                                'rgba(46, 125, 50, 0.08)',
                            },
                          }}
                        >
                          {mostrarConfirmacion ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />


              {/* =========================================
                  BOTONES
              ========================================== */}

              <Box
                sx={{
                  display: 'flex',

                  flexDirection: {
                    xs: 'column-reverse',
                    sm: 'row',
                  },

                  justifyContent:
                    'center',

                  gap: 1.5,
                }}
              >

                {/* VOLVER */}

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={
                    <ArrowBackIcon />
                  }
                  onClick={
                    handleVolverDashboard
                  }
                  disabled={guardando}
                  sx={{
                    minHeight: 42,

                    minWidth: {
                      xs: '100%',
                      sm: 180,
                    },

                    borderRadius: 1.5,
                  }}
                >
                  Volver al Dashboard
                </Button>


                {/* GUARDAR */}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    guardando ||
                    exito
                  }
                  sx={{
                    minHeight: 42,

                    minWidth: {
                      xs: '100%',
                      sm: 180,
                    },

                    borderRadius: 1.5,
                  }}
                >
                  {guardando ? (
                    <>
                      <CircularProgress
                        size={20}
                        color="inherit"
                        sx={{
                          mr: 1,
                        }}
                      />

                      Guardando...
                    </>
                  ) : (
                    'Cambiar contraseña'
                  )}
                </Button>

              </Box>

            </Box>

          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}


export default CambiarContrasena