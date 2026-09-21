import {
  Dashboard as DashboardIcon,
  Business,
  People,
  Assessment,
  Settings,
  Logout,
  Menu,
} from '@mui/icons-material'

import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'


const drawerWidth = 240
const collapsedWidth = 72


function Sidebar({
  collapsed,
  onToggle,
  onLogout,
  mobileOpen,
  onMobileClose,
  onMobileNavigate,
}) {
  const { perfil } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const theme = useTheme()

  /*
   * Debajo de md tratamos la navegación como móvil/tablet.
   */
  const isMobile = useMediaQuery(
    theme.breakpoints.down('md')
  )

  const permiso = perfil?.permiso?.nombre


  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'Empresas',
      icon: <Business />,
      path: '/empresas',
    },
    {
      text: 'Usuarios',
      icon: <People />,
      path: '/usuarios',
      permissions: ['ADMIN'],
    },
    {
      text: 'Costos',
      icon: <Assessment />,
      path: '/costos',
    },
    {
      text: 'Reportes',
      icon: <Assessment />,
      path: '/reportes',
    },
    {
      text: 'Configuración',
      icon: <Settings />,
      path: '/configuracion',
      permissions: ['ADMIN'],
    },
  ]


  const itemsVisibles = menuItems.filter((item) => {
    if (!item.permissions) {
      return true
    }

    return item.permissions.includes(permiso)
  })


  const handleNavigate = (path) => {
    navigate(path)

    if (isMobile && onMobileNavigate) {
      onMobileNavigate()
    }
  }


  const handleLogout = () => {
    if (isMobile && onMobileClose) {
      onMobileClose()
    }

    onLogout()
  }


  const isActive = (path) => {
    return location.pathname === path
  }


  /*
   * SIDEBAR MÓVIL
   */
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',

            backgroundColor: 'background.paper',

            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {/* HEADER DEL SIDEBAR */}

        <Box
          sx={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
          }}
        >
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            Costos Rotondo
          </Typography>

          <IconButton
            onClick={onMobileClose}
            color="primary"
            aria-label="Cerrar menú"
          >
            <Menu />
          </IconButton>
        </Box>


        <Divider />


        {/* MENÚ */}

        <List
          sx={{
            px: 0.5,
            py: 1,
          }}
        >
          {itemsVisibles.map((item) => {
            const active = isActive(item.path)

            return (
              <ListItemButton
                key={item.text}
                selected={active}
                onClick={() =>
                  handleNavigate(item.path)
                }
                sx={{
                  minHeight: 48,
                  justifyContent: 'initial',
                  px: 2,

                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',

                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },

                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },

                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                />
              </ListItemButton>
            )
          })}
        </List>


        {/* FOOTER */}

        <Box
          sx={{
            marginTop: 'auto',
          }}
        >
          <Divider />

          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,
              justifyContent: 'initial',
              px: 2,

              color: 'text.secondary',

              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'error.main',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              <Logout />
            </ListItemIcon>

            <ListItemText
              primary="Cerrar sesión"
            />
          </ListItemButton>
        </Box>
      </Drawer>
    )
  }


  /*
   * SIDEBAR DESKTOP
   */
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed
          ? collapsedWidth
          : drawerWidth,

        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: collapsed
            ? collapsedWidth
            : drawerWidth,

          boxSizing: 'border-box',
          overflowX: 'hidden',

          transition: (theme) =>
            theme.transitions.create(
              'width',
              {
                duration:
                  theme.transitions.duration.shortest,
              }
            ),

          backgroundColor: 'background.paper',

          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* HEADER DEL SIDEBAR */}

      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',

          justifyContent: collapsed
            ? 'center'
            : 'space-between',

          px: 1.5,
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            Costos Rotondo
          </Typography>
        )}

        <IconButton
          onClick={onToggle}
          color="primary"
          aria-label={
            collapsed
              ? 'Expandir menú'
              : 'Colapsar menú'
          }
        >
          <Menu />
        </IconButton>
      </Box>


      <Divider />


      {/* MENÚ */}

      <List
        sx={{
          px: 0.5,
          py: 1,
        }}
      >
        {itemsVisibles.map((item) => {
          const active = isActive(item.path)

          const button = (
            <ListItemButton
              key={item.text}
              selected={active}
              onClick={() =>
                handleNavigate(item.path)
              }
              sx={{
                minHeight: 48,

                justifyContent: collapsed
                  ? 'center'
                  : 'initial',

                px: 2,

                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',

                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },

                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },

                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary={item.text}
                />
              )}
            </ListItemButton>
          )


          if (collapsed) {
            return (
              <Tooltip
                key={item.text}
                title={item.text}
                placement="right"
              >
                {button}
              </Tooltip>
            )
          }


          return button
        })}
      </List>


      {/* FOOTER */}

      <Box
        sx={{
          marginTop: 'auto',
        }}
      >
        <Divider />

        <Tooltip
          title={
            collapsed
              ? 'Cerrar sesión'
              : ''
          }
          placement="right"
        >
          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 48,

              justifyContent: collapsed
                ? 'center'
                : 'initial',

              px: 2,

              color: 'text.secondary',

              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'error.main',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              <Logout />
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary="Cerrar sesión"
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  )
}


export default Sidebar