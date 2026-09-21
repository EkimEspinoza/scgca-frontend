import {
  AccountCircle,
  ExpandMore,
  Menu as MenuIcon,
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

import { useAuth } from '../../context/AuthContext'
import { useEmpresa } from '../../context/EmpresaContext'


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

          /*
           * Ya no utilizamos
           * space-between directamente.
           *
           * Dividimos el Header en:
           * izquierda / derecha.
           */
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
        ================================================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: {
              xs: 0,
              sm: 0.5,
              md: 1,
            },

            flexShrink: 0,
          }}
        >

          <IconButton
            onClick={
              handleMenuOpen
            }
            color="inherit"
            sx={{
              p: {
                xs: 0.75,
                sm: 1,
              },
            }}
          >
            <AccountCircle />
          </IconButton>


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

          <MenuItem disabled>
            {perfil?.nombre}{' '}
            {perfil?.apellido}
          </MenuItem>

          <Divider />

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