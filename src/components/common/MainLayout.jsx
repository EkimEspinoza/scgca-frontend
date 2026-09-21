import { useState } from 'react'
import { Box } from '@mui/material'

import Sidebar from '../layout/Sidebar'
import Header from './Header'


function MainLayout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)


  const handleToggleSidebar = () => {
    setCollapsed((valor) => !valor)
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
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={handleCloseMobileSidebar}
        onMobileNavigate={handleNavigateMobile}
      />


      <Header
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileMenuOpen={handleOpenMobileSidebar}
      />


      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: '100%',

          p: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },

          pt: {
            xs: 9,
            sm: 9,
            md: 10,
          },

          backgroundColor: 'background.default',

          minHeight: '100vh',

          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}


export default MainLayout