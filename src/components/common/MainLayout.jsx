import { useState } from 'react'
import { Box, useMediaQuery } from '@mui/material'

import Sidebar from '../layout/Sidebar'
import Header from './Header'


function MainLayout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedTablet, setExpandedTablet] = useState(false)
  const tablet = useMediaQuery('(min-width: 768px) and (max-width: 1199.95px)')
  const sidebarCollapsed = tablet ? !expandedTablet : collapsed


  const handleToggleSidebar = () => {
    if (tablet) setExpandedTablet((valor) => !valor)
    else setCollapsed((valor) => !valor)
  }


  const handleOpenMobileSidebar = () => {
    setMobileOpen(true)
  }


  const handleCloseMobileSidebar = () => {
    setMobileOpen(false)
  }


  const handleNavigateMobile = () => {
    setMobileOpen(false)
  }


  return (
    <Box
      sx={{
        display: 'flex',
        height: '100dvh',
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={handleCloseMobileSidebar}
        onMobileNavigate={handleNavigateMobile}
      />


      <Header
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileMenuOpen={handleOpenMobileSidebar}
      />


      <Box
  component="main"
  sx={{
    flex: '1 1 0%',
    minWidth: 0,
    maxWidth: '100%',

    /*
     * El área principal ocupa exactamente
     * el alto disponible de la ventana.
     */
    height: '100dvh',
    maxHeight: '100dvh',
    minHeight: 0,

    /*
     * Evita que el módulo genere
     * un segundo scrollbar.
     */
    overflow: 'hidden',

    boxSizing: 'border-box',

    p: {
      xs: 1,
      sm: 1.5,
      md: 2,
    },

    /*
     * Espacio reservado para el Header.
     */
    pt: {
      xs: 8.5,
      sm: 8.5,
      md: 9,
    },

    backgroundColor: (theme) => ['dark', 'light'].includes(theme.scgca?.themeId)
      ? 'transparent'
      : theme.palette.background.default,
  }}
>
        {children}
      </Box>
    </Box>
  )
}


export default MainLayout
