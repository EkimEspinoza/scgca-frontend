// Compone la pantalla CambiarContrasena y conecta sus componentes.
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

import { useCambiarContrasena } from '../hooks/useCambiarContrasena'


function CambiarContrasena() {
  const {
    cargando, guardando, contrasena, setContrasena, confirmarContrasena, setConfirmarContrasena,
    mostrarContrasena, setMostrarContrasena, mostrarConfirmacion, setMostrarConfirmacion,
    error, exito, handleGuardar, handleVolverDashboard,
  } = useCambiarContrasena()
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
                  'action.selected',

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
                                'action.hover',
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
                                'action.hover',
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
