// Define el componente reutilizable Sidebar.
import { useState } from 'react'
import {
    Logout,
    Menu,
    ExpandMore,
    ChevronRight,
    Category,
    AdminPanelSettings,
    AccessTime,
    Person,
    ListAlt,
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
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { getVisibleSidebarItems, sidebarGroupRoutes } from './sidebarNavigation'
import { SidebarPrimaryItems, SidebarSubmenuItems } from './SidebarNavigationItems'
import SidebarThemeToggle from './SidebarThemeToggle'

const drawerWidth = 240
const collapsedWidth = 72
const activeNavItemSx = {
    position: 'relative',
    backgroundColor: 'var(--primary-soft)',
    color: 'var(--primary-active-text)',
    '&::before': {
        content: '""', position: 'absolute', insetBlock: 6, left: 0, width: 3,
        borderRadius: '0 3px 3px 0', backgroundColor: 'var(--primary-active-text)',
    },
    '&:hover': { backgroundColor: 'var(--primary-soft)' },
    '& .MuiListItemIcon-root': { color: 'var(--primary-active-text)' },
}

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
    /*
     * Debajo de md tratamos la navegación como móvil/tablet.
     */
    const isMobile = useMediaQuery('(max-width: 767.95px)')
    const permiso = perfil?.permiso?.nombre

    /*
     * Estado del grupo Maestros.
     * Se abre automáticamente si estamos dentro de alguna de sus opciones.
     */
    const maestrosActivo = sidebarGroupRoutes.maestros.some((path) =>
        location.pathname.startsWith(path)
    )
    const [maestrosOpen, setMaestrosOpen] = useState(maestrosActivo)
    const tareosActivo = sidebarGroupRoutes.tareos.some((path) => location.pathname.startsWith(path))
    const [tareosOpen, setTareosOpen] = useState(tareosActivo)
    const manoObraActivo = sidebarGroupRoutes.manoObra.some((path) => location.pathname.startsWith(path))
    const [manoObraOpen, setManoObraOpen] = useState(manoObraActivo)
    const serviciosActivo = sidebarGroupRoutes.servicios.some((path) => location.pathname.startsWith(path))
    const [serviciosOpen, setServiciosOpen] = useState(serviciosActivo)
    const accesosActivo = sidebarGroupRoutes.accesos.some((path) => location.pathname.startsWith(path))
    const [accesosOpen, setAccesosOpen] = useState(accesosActivo)

    const { menuItems: itemsVisibles, maestrosItems: maestrosVisibles, tareosItems: tareosVisibles, manoObraItems: manoObraVisibles, serviciosItems: serviciosVisibles, accesosItems } = getVisibleSidebarItems(perfil, permiso)

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

    const handleTareosToggle = () => {
        if (!isMobile && collapsed) {
            onToggle()
            setTareosOpen(true)
            return
        }
        setTareosOpen((prev) => !prev)
    }

    const handleManoObraToggle = () => {
        if (!isMobile && collapsed) {
            onToggle()
            setManoObraOpen(true)
            return
        }
        setManoObraOpen((prev) => !prev)
    }

    const handleServiciosToggle = () => {
        if (!isMobile && collapsed) {
            onToggle()
            setServiciosOpen(true)
            return
        }
        setServiciosOpen((prev) => !prev)
    }

    const handleAccesosToggle = () => {
        if (!isMobile && collapsed) {
            onToggle()
            setAccesosOpen(true)
            return
        }
        setAccesosOpen((prev) => !prev)
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
                        backgroundColor: 'scgca.sidebar',
                        backdropFilter: 'none',
                        WebkitBackdropFilter: 'none',
                        boxShadow: (theme) => theme.scgca?.themeId === 'dark'
                            ? 'inset -1px 0 rgba(255, 255, 255, 0.05)'
                            : theme.scgca?.themeId === 'light' ? 'inset -1px 0 rgba(31, 41, 55, 0.06)' : undefined,
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
                    <Tooltip title="Cerrar menú" placement="right">
                        <IconButton onClick={onMobileClose} color="primary" aria-label="Cerrar menú">
                            <Menu />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Divider />

                {/* MENÚ PRINCIPAL */}
                <List sx={{ px: 0.5, py: 0.75 }}>
                    <SidebarPrimaryItems items={itemsVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} />

                    {tareosVisibles.length > 0 && (
                        <>
                            <ListItemButton
                                onClick={handleTareosToggle}
                                sx={{ minHeight: 42, px: 2, backgroundColor: tareosActivo ? 'action.hover' : 'transparent', '&:hover': { backgroundColor: 'action.hover' } }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                                    <AccessTime fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Tareos" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                                {tareosOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                            </ListItemButton>
                            <Collapse in={tareosOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <SidebarSubmenuItems items={tareosVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} />
                                </List>
                            </Collapse>
                        </>
                    )}

                    {manoObraVisibles.length > 0 && (
                        <>
                            <ListItemButton onClick={handleManoObraToggle} sx={{ minHeight: 42, px: 2, backgroundColor: manoObraActivo ? 'action.hover' : 'transparent', '&:hover': { backgroundColor: 'action.hover' } }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}><Person fontSize="small" /></ListItemIcon>
                                <ListItemText primary="Mano de Obra" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                                {manoObraOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                            </ListItemButton>
                            <Collapse in={manoObraOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <SidebarSubmenuItems items={manoObraVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} separators />
                                </List>
                            </Collapse>
                        </>
                    )}

                    {serviciosVisibles.length > 0 && (
                        <>
                            <ListItemButton onClick={handleServiciosToggle} sx={{ minHeight: 42, px: 2, backgroundColor: serviciosActivo ? 'action.hover' : 'transparent', '&:hover': { backgroundColor: 'action.hover' } }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}><ListAlt fontSize="small" /></ListItemIcon>
                                <ListItemText primary="Servicios" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                                {serviciosOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                            </ListItemButton>
                            <Collapse in={serviciosOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <SidebarSubmenuItems items={serviciosVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} />
                                </List>
                            </Collapse>
                        </>
                    )}

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
                            <SidebarSubmenuItems items={maestrosVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} hover />
                        </List>
                    </Collapse>
                    {permiso === 'ADMIN' && (
                        <>
                            <ListItemButton onClick={handleAccesosToggle} sx={{ minHeight: 42, px: 2, backgroundColor: accesosActivo ? 'action.hover' : 'transparent', '&:hover': { backgroundColor: 'action.hover' } }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}><AdminPanelSettings fontSize="small" /></ListItemIcon>
                                <ListItemText primary="Accesos" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                                {accesosOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                            </ListItemButton>
                            <Collapse in={accesosOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <SidebarSubmenuItems items={accesosItems} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} />
                                </List>
                            </Collapse>
                        </>
                    )}
                </List>

                {/* FOOTER MÓVIL */}
                <Box sx={{ marginTop: 'auto' }}>
                    <Divider />
                    <SidebarThemeToggle />
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
                    backgroundColor: 'scgca.sidebar',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    boxShadow: (theme) => theme.scgca?.themeId === 'dark'
                        ? 'inset -1px 0 rgba(255, 255, 255, 0.05)'
                        : theme.scgca?.themeId === 'light' ? 'inset -1px 0 rgba(31, 41, 55, 0.06)' : undefined,
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
                <Tooltip title={collapsed ? 'Expandir menú' : 'Colapsar menú'} placement="right">
                    <IconButton onClick={onToggle} color="primary" aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}>
                        <Menu />
                    </IconButton>
                </Tooltip>
            </Box>
            <Divider />

            {/* MENÚ PRINCIPAL */}
            <List sx={{ px: 0.5, py: 0.75 }}>
                <SidebarPrimaryItems items={itemsVisibles} collapsed={collapsed} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} />

                {tareosVisibles.length > 0 && (
                    <>
                        {!collapsed && (
                            <ListItemButton
                                onClick={handleTareosToggle}
                                sx={{ minHeight: 42, px: 2, backgroundColor: tareosActivo ? 'action.hover' : 'transparent', '&:hover': { backgroundColor: 'action.hover' } }}
                            >
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}>
                                    <AccessTime fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Tareos" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                                {tareosOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                            </ListItemButton>
                        )}
                        {!collapsed && (
                            <Collapse in={tareosOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <SidebarSubmenuItems items={tareosVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} />
                                </List>
                            </Collapse>
                        )}
                        {collapsed && (
                            <Tooltip title="Tareos" placement="right">
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <ListItemButton onClick={handleTareosToggle} sx={{ minHeight: 42, justifyContent: 'center', px: 2, backgroundColor: tareosActivo ? 'action.hover' : 'transparent' }}>
                                        <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                                            <AccessTime fontSize="small" />
                                        </ListItemIcon>
                                    </ListItemButton>
                                </Box>
                            </Tooltip>
                        )}
                    </>
                )}

                {manoObraVisibles.length > 0 && (
                    <>
                        {!collapsed && (
                            <ListItemButton onClick={handleManoObraToggle} sx={{ minHeight: 42, px: 2, backgroundColor: manoObraActivo ? 'action.hover' : 'transparent', '&:hover': { backgroundColor: 'action.hover' } }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}><Person fontSize="small" /></ListItemIcon>
                                <ListItemText primary="Mano de Obra" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                                {manoObraOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                            </ListItemButton>
                        )}
                        {!collapsed && (
                            <Collapse in={manoObraOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <SidebarSubmenuItems items={manoObraVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} separators />
                                </List>
                            </Collapse>
                        )}
                        {collapsed && (
                            <Tooltip title="Mano de Obra" placement="right">
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <ListItemButton onClick={handleManoObraToggle} sx={{ minHeight: 42, justifyContent: 'center', px: 2, backgroundColor: manoObraActivo ? 'action.hover' : 'transparent' }}>
                                        <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}><Person fontSize="small" /></ListItemIcon>
                                    </ListItemButton>
                                </Box>
                            </Tooltip>
                        )}
                    </>
                )}

                {serviciosVisibles.length > 0 && (
                    <>
                        {!collapsed && (
                            <ListItemButton onClick={handleServiciosToggle} sx={{ minHeight: 42, px: 2, backgroundColor: serviciosActivo ? 'action.hover' : 'transparent', '&:hover': { backgroundColor: 'action.hover' } }}>
                                <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}><ListAlt fontSize="small" /></ListItemIcon>
                                <ListItemText primary="Servicios" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                                {serviciosOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                            </ListItemButton>
                        )}
                        {!collapsed && (
                            <Collapse in={serviciosOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <SidebarSubmenuItems items={serviciosVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} />
                                </List>
                            </Collapse>
                        )}
                        {collapsed && (
                            <Tooltip title="Servicios" placement="right">
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <ListItemButton onClick={handleServiciosToggle} sx={{ minHeight: 42, justifyContent: 'center', px: 2, backgroundColor: serviciosActivo ? 'action.hover' : 'transparent' }}>
                                        <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}><ListAlt fontSize="small" /></ListItemIcon>
                                    </ListItemButton>
                                </Box>
                            </Tooltip>
                        )}
                    </>
                )}

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
                            <SidebarSubmenuItems items={maestrosVisibles} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} hover />
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
                {permiso === 'ADMIN' && !collapsed && (
                    <>
                        <ListItemButton onClick={handleAccesosToggle} sx={{ minHeight: 42, px: 2, backgroundColor: accesosActivo ? 'action.hover' : 'transparent', '&:hover': { backgroundColor: 'action.hover' } }}>
                            <ListItemIcon sx={{ minWidth: 0, mr: 2, justifyContent: 'center' }}><AdminPanelSettings fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Accesos" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
                            {accesosOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                        </ListItemButton>
                        <Collapse in={accesosOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <SidebarSubmenuItems items={accesosItems} isActive={isActive} onNavigate={handleNavigate} selectedSx={activeNavItemSx} />
                            </List>
                        </Collapse>
                    </>
                )}
                {permiso === 'ADMIN' && collapsed && (
                    <Tooltip title="Accesos" placement="right">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <ListItemButton onClick={handleAccesosToggle} sx={{ minHeight: 42, justifyContent: 'center', px: 2 }}>
                                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}><AdminPanelSettings fontSize="small" /></ListItemIcon>
                            </ListItemButton>
                        </Box>
                    </Tooltip>
                )}
            </List>

            {/* FOOTER DESKTOP */}
            <Box sx={{ marginTop: 'auto' }}>
                <Divider />
                <SidebarThemeToggle collapsed={collapsed} />
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
