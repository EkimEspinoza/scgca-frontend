import {
  AccountCircle,
  ExpandMore,
  Menu as MenuIcon,
  LockOutlined,
} from '@mui/icons-material'

import {
  AppBar,
  Box,
  Divider,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import { useState } from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../context/useAuth'
import { useEmpresa } from '../../context/useEmpresa'


function Header({
  collapsed,
  onMobileMenuOpen,
}) {
  const {
    perfil,
    logout,
  } = useAuth()

  const {
    empresas,
    empresaActual,
    cambiarEmpresa,
    esAdmin,
  } = useEmpresa()

  const navigate =
    useNavigate()

  const [
    anchorEl,
    setAnchorEl,
  ] = useState(null)

  const menuOpen =
    Boolean(anchorEl)

  const theme =
    useTheme()

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down('md'),
    )


  const handleMenuOpen = (
    event,
  ) => {
    setAnchorEl(
      event.currentTarget,
    )
  }


  const handleMenuClose = () => {
    setAnchorEl(null)
  }


  const handleCambiarContrasena = () => {
    handleMenuClose()

    navigate(
      '/cambiar-contrasena',
    )
  }


  const handleLogout = async () => {
    handleMenuClose()
    await logout()
  }


  const handleEmpresaChange = (
    event,
  ) => {
    const value =
      event.target.value

    if (value === 'TODAS') {
      cambiarEmpresa(null)
      return
    }

    const empresa =
      empresas.find(
        (item) =>
          String(
            item.id_empresa,
          ) === String(value),
      )

    if (empresa) {
      cambiarEmpresa(empresa)
    }
  }


  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        zIndex: (theme) =>
          theme.zIndex.drawer + 1,

        borderBottom:
          '1px solid',

        borderColor:
          'divider',

        backgroundColor:
          'background.paper',

        ml: {
          xs: 0,
          md: collapsed
            ? '72px'
            : '240px',
        },

        width: {
          xs: '100%',
          md: collapsed
            ? 'calc(100% - 72px)'
            : 'calc(100% - 240px)',
        },

        transition: (theme) =>
          theme.transitions.create(
            [
              'margin',
              'width',
            ],
            {
              duration:
                theme.transitions
                  .duration
                  .shortest,
            },
          ),
      }}
    >
      <Toolbar
        sx={{
          minHeight:
            '64px !important',

          justifyContent:
            'space-between',

          gap: {
            xs: 1,
            sm: 2,
            md: 3,
          },

          px: {
            xs: 1,
            sm: 2,
            md: 3,
          },
        }}
      >

        {/* =================================================
            BLOQUE IZQUIERDO
        ================================================== */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: {
              xs: 0.5,
              sm: 1,
              md: 2,
            },

            minWidth: 0,
            flex: 1,
          }}
        >

          {/* MENÚ MÓVIL */}

          {isMobile && (
            <IconButton
              onClick={
                onMobileMenuOpen
              }
              color="primary"
              aria-label="Abrir menú"
              sx={{
                flexShrink: 0,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}


          {/* EMPRESA */}

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: 145,
                sm: 180,
                md: 200,
              },

              maxWidth: {
                xs: 220,
                sm: 260,
                md: 300,
              },

              flexShrink: 1,
            }}
          >
            <Select
              value={
                empresaActual
                  ?.id_empresa ??
                'TODAS'
              }
              onChange={
                handleEmpresaChange
              }
              displayEmpty
              sx={{
                fontSize: {
                  xs: 13,
                  sm: 14,
                },

                fontWeight: 600,

                backgroundColor:
                  'background.paper',

                '& .MuiSelect-select': {
                  py: 1,
                },
              }}
            >

              {esAdmin && (
                <MenuItem
                  value="TODAS"
                >
                  Todas las empresas
                </MenuItem>
              )}

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
                    {
                      empresa.nombre_comercial
                    }
                  </MenuItem>
                ),
              )}

            </Select>
          </FormControl>

        </Box>


        {/* =================================================
            BLOQUE DERECHO — USUARIO
            Todo el bloque abre el menú
        ================================================== */}

        <Box
          onClick={
            handleMenuOpen
          }
          role="button"
          tabIndex={0}
          onKeyDown={(
            event,
          ) => {
            if (
              event.key ===
                'Enter' ||
              event.key === ' '
            ) {
              event.preventDefault()

              handleMenuOpen(event)
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',

            gap: {
              xs: 0,
              sm: 0.5,
              md: 1,
            },

            flexShrink: 0,

            cursor: 'pointer',

            borderRadius: 1,

            px: {
              xs: 0.5,
              sm: 1,
            },

            py: 0.5,

            transition:
              'background-color 0.15s ease',

            '&:hover': {
              backgroundColor:
                'action.hover',
            },

            '&:focus-visible': {
              outline:
                '2px solid',
              outlineColor:
                'primary.main',
              outlineOffset: 2,
            },
          }}
        >

          {/* ICONO DE USUARIO */}

          <IconButton
            color="inherit"
            aria-label="Menú de usuario"
            sx={{
              p: {
                xs: 0.75,
                sm: 1,
              },

              pointerEvents:
                'none',
            }}
          >
            <AccountCircle />
          </IconButton>


          {/* INFORMACIÓN DEL USUARIO */}

          <Box
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },

              minWidth: {
                sm: 100,
                md: 120,
              },

              maxWidth: {
                sm: 140,
                md: 180,
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color:
                  'text.primary',

                whiteSpace:
                  'nowrap',

                overflow:
                  'hidden',

                textOverflow:
                  'ellipsis',
              }}
            >
              {perfil?.nombre}{' '}
              {perfil?.apellido}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                whiteSpace:
                  'nowrap',
              }}
            >
              {
                perfil?.permiso
                  ?.nombre
              }
            </Typography>
          </Box>


          {/* FLECHA */}

          <ExpandMore
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },

              color:
                'text.secondary',

              fontSize: 20,
            }}
          />

        </Box>


        {/* =================================================
            MENÚ USUARIO
        ================================================== */}

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={
            handleMenuClose
          }
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >

          {/* USUARIO */}

          <MenuItem disabled>
            {perfil?.nombre}{' '}
            {perfil?.apellido}
          </MenuItem>


          <Divider />


          {/* CAMBIAR CONTRASEÑA */}

          <MenuItem
            onClick={
              handleCambiarContrasena
            }
          >
            <LockOutlined
              fontSize="small"
              sx={{
                mr: 1.5,
                color:
                  'text.secondary',
              }}
            />

            Cambiar contraseña
          </MenuItem>


          <Divider />


          {/* CERRAR SESIÓN */}

          <MenuItem
            onClick={
              handleLogout
            }
          >
            Cerrar sesión
          </MenuItem>

        </Menu>

      </Toolbar>
    </AppBar>
  )
}


export default Header