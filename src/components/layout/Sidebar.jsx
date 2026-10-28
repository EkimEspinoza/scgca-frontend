import { useState } from 'react'
import {
    Dashboard as DashboardIcon,
    People,
    Assessment,
    Settings,
    Logout,
    Menu,
    ExpandMore,
    ChevronRight,
    Category,
} from '@mui/icons-material'
import {
    Box,
    Collapse,
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
import { useAuth } from '../../context/useAuth'

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
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const permiso = perfil?.permiso?.nombre

    /*
     * Estado del grupo Maestros.
     * Se abre automáticamente si estamos dentro de alguna de sus opciones.
     */
    const rutasMaestros = [
        '/empresas',
        '/etapa-costo',
        '/centro-costos',
        '/variedades',
        '/tipos-centro-costo',
        '/tipos-maquinaria',
        '/comparativos',
        '/tipo-cambio',
        '/campañas',
    ]
    const maestrosActivo = rutasMaestros.some((path) =>
        location.pathname.startsWith(path)
    )
    const [maestrosOpen, setMaestrosOpen] = useState(maestrosActivo)

    /*
     * Menú principal.
     */
    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon fontSize="small" />,
            path: '/dashboard',
        },
        {
            text: 'Usuarios',
            icon: <People fontSize="small" />,
            path: '/usuarios',
            permissions: ['ADMIN'],
        },
        {
            text: 'Reportes',
            icon: <Assessment fontSize="small" />,
            path: '/reportes',
        },
        {
            text: 'Configuración',
            icon: <Settings fontSize="small" />,
            path: '/configuracion',
            permissions: ['ADMIN'],
        },
    ]

    /*
     * Opciones del grupo Maestros.
     */
    const maestrosItems = [
        {
            text: 'Campañas',
            path: '/campanas',
            permissions: ['ADMIN'],
        },
        {
            text: 'Centro de Costos',
            path: '/centro-costos',
            permissions: ['ADMIN'],
        },
        {
            text: 'Comparativos',
            path: '/comparativos',
            permissions: ['ADMIN'],
        },
        {
            text: 'Empresas',
            path: '/empresas',
            permissions: ['ADMIN'],
        },
        {
            text: 'Etapa de Costo Inversión',
            path: '/etapa-costo',
            permissions: ['ADMIN'],
        },
        {
            text: 'Tipos de Centro de Costo',
            path: '/tipos-centro-costo',
            permissions: ['ADMIN'],
        },
        {
            text: 'Tipos de Maquinaria',
            path: '/tipos-maquinaria',
            permissions: ['ADMIN'],
        },
        {
            text: 'Variedades',
            path: '/variedades',
            permissions: ['ADMIN'],
        },
        {
            text: 'Tipo Cambio',
            path: '/tipo-cambio',
            permissions: ['ADMIN'],
        },
    ]

    /*
     * Filtrar opciones según el permiso del usuario.
     */
    const itemsVisibles = menuItems.filter((item) => {
        if (!item.permissions) return true
        return item.permissions.includes(permiso)
    })
    const maestrosVisibles = maestrosItems.filter((item) => {
        if (!item.permissions) return true
        return item.permissions.includes(permiso)
    })

    /*
     * Navegar a una ruta y cerrar el menú móvil cuando corresponda.
     */
    const handleNavigate = (path) => {
        navigate(path)
        if (isMobile && onMobileNavigate) {
            onMobileNavigate()
        }
    }

    /*
     * Cerrar sesión.
     */
    const handleLogout = () => {
        if (isMobile && onMobileClose) {
            onMobileClose()
        }
        onLogout()
    }

    /*
     * Abrir o cerrar el grupo Maestros.
     * Si el Sidebar está colapsado en desktop, primero lo expandimos.
     */
    const handleMaestrosToggle = () => {
        if (!isMobile && collapsed) {
            onToggle()
            setMaestrosOpen(true)
            return
        }
        setMaestrosOpen((prev) => !prev)
    }

    /*
     * Determinar si una ruta está activa.
     */
    const isActive = (path) => location.pathname === path

    /*
     * SIDEBAR MÓVIL.
     */
    if (isMobile) {
        return (
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }}
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
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.25,
                    }}
                >
                    <Typography
                        variant="h6"
                        color="primary"
                        sx={{
                            fontSize: '1.125rem',
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

                {/* MENÚ PRINCIPAL */}
                <List sx={{ px: 0.5, py: 0.75 }}>
                    {itemsVisibles.map((item) => {
                        const active = isActive(item.path)
                        return (
                            <ListItemButton
                                key={item.text}
                                selected={active}
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    minHeight: 42,
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
                            <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                            </ListItemButton>
                        )
                    })}

                    {/* GRUPO MAESTROS */}
                    <ListItemButton
                        onClick={handleMaestrosToggle}
                        sx={{
                            minHeight: 42,
                            justifyContent: 'initial',
                            px: 2,
                            backgroundColor: maestrosActivo
                                ? 'action.hover'
                                : 'transparent',
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
                            <Category fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Maestros" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                        {maestrosOpen ? (
                            <ExpandMore fontSize="small" />
                        ) : (
                            <ChevronRight fontSize="small" />
                        )}
                    </ListItemButton>
                    <Collapse in={maestrosOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {maestrosVisibles.map((item) => {
                                const active = isActive(item.path)
                                return (
                                    <ListItemButton
                                        key={item.text}
                                        selected={active}
                                        onClick={() => handleNavigate(item.path)}
                                        sx={{
                                            minHeight: 38,
                                            /*
                                             * Se mantiene el ajuste de indentación
                                             * para acercar las opciones hacia la izquierda.
                                             */
                                            pl: 2.5,
                                            pr: 1.5,
                                            '&.Mui-selected': {
                                                backgroundColor: 'primary.main',
                                                color: 'primary.contrastText',
                                                '&:hover': {
                                                    backgroundColor: 'primary.dark',
                                                },
                                            },
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                        }}
                                    >
                                        <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.75rem', lineHeight: 1.2 } }} />
                                    </ListItemButton>
                                )
                            })}
                        </List>
                    </Collapse>
                </List>

                {/* FOOTER MÓVIL */}
                <Box sx={{ marginTop: 'auto' }}>
                    <Divider />
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            minHeight: 42,
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
                                <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar sesión" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                    </ListItemButton>
                </Box>
            </Drawer>
        )
    }

    /*
     * SIDEBAR DESKTOP.
     */
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: collapsed ? collapsedWidth : drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: collapsed ? collapsedWidth : drawerWidth,
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                    transition: (theme) =>
                        theme.transitions.create('width', {
                            duration: theme.transitions.duration.shortest,
                        }),
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                },
            }}
        >
            {/* HEADER DEL SIDEBAR */}
            <Box
                sx={{
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    px: 1.25,
                }}
            >
                {!collapsed && (
                    <Typography
                        variant="h6"
                        color="primary"
                        sx={{
                            fontSize: '1.125rem',
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
                    aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                >
                    <Menu />
                </IconButton>
            </Box>
            <Divider />

            {/* MENÚ PRINCIPAL */}
            <List sx={{ px: 0.5, py: 0.75 }}>
                {itemsVisibles.map((item) => {
                    const active = isActive(item.path)
                    const button = (
                        <ListItemButton
                            key={item.text}
                            selected={active}
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                                minHeight: 42,
                                justifyContent: collapsed ? 'center' : 'initial',
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
                            {!collapsed && <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />}
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

                {/* GRUPO MAESTROS DESKTOP */}
                <ListItemButton
                    onClick={handleMaestrosToggle}
                    sx={{
                        minHeight: 42,
                        justifyContent: collapsed ? 'center' : 'initial',
                        px: 2,
                        backgroundColor: maestrosActivo
                            ? 'action.hover'
                            : 'transparent',
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
                        <Category fontSize="small" />
                    </ListItemIcon>
                    {!collapsed && (
                        <>
                            <ListItemText primary="Maestros" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                            {maestrosOpen ? (
                                <ExpandMore fontSize="small" />
                            ) : (
                                <ChevronRight fontSize="small" />
                            )}
                        </>
                    )}
                </ListItemButton>
                {!collapsed && (
                    <Collapse in={maestrosOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {maestrosVisibles.map((item) => {
                                const active = isActive(item.path)
                                return (
                                    <ListItemButton
                                        key={item.text}
                                        selected={active}
                                        onClick={() => handleNavigate(item.path)}
                                        sx={{
                                            minHeight: 38,
                                            /*
                                             * Se mantiene el ajuste de indentación
                                             * que mueve las opciones hacia la izquierda.
                                             */
                                            pl: 2.5,
                                            pr: 1.5,
                                            '&.Mui-selected': {
                                                backgroundColor: 'primary.main',
                                                color: 'primary.contrastText',
                                                '&:hover': {
                                                    backgroundColor: 'primary.dark',
                                                },
                                            },
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                        }}
                                    >
                                        {/*
                                         * Las opciones de Maestros no utilizan iconos individuales.
                                         */}
                                        <ListItemText primary={item.text} sx={{ '& .MuiListItemText-primary': { fontSize: '0.75rem', lineHeight: 1.2 } }} />
                                    </ListItemButton>
                                )
                            })}
                        </List>
                    </Collapse>
                )}
                {collapsed && (
                    <Tooltip title="Maestros" placement="right">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <ListItemButton
                                onClick={handleMaestrosToggle}
                                sx={{
                                    minHeight: 42,
                                    justifyContent: 'center',
                                    px: 2,
                                    backgroundColor: maestrosActivo
                                        ? 'action.hover'
                                        : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Category fontSize="small" />
                                </ListItemIcon>
                            </ListItemButton>
                        </Box>
                    </Tooltip>
                )}
            </List>

            {/* FOOTER DESKTOP */}
            <Box sx={{ marginTop: 'auto' }}>
                <Divider />
                <Tooltip
                    title={collapsed ? 'Cerrar sesión' : ''}
                    placement="right"
                >
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            minHeight: 42,
                            justifyContent: collapsed ? 'center' : 'initial',
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
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        {!collapsed && <ListItemText primary="Cerrar sesión" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />}
                    </ListItemButton>
                </Tooltip>
            </Box>
        </Drawer>
    )
}

export default Sidebar
