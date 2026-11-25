// Presenta el control del tema claro y oscuro en el sidebar.
import { useRef } from 'react'
import { LightMode, DarkMode } from '@mui/icons-material'
import { Box, IconButton, ListItemText, Tooltip } from '@mui/material'
import { useAppTheme } from '../../context/useAppTheme'

function SidebarThemeToggle({ collapsed = false }) {
    const { themeName, cambiarTema, guardandoTema } = useAppTheme()
    const clickOrigin = useRef(null)
    const isDark = themeName === 'dark'
    const ModeIcon = isDark ? DarkMode : LightMode

    const handleToggle = async (event) => {
        clickOrigin.current = { x: event.clientX, y: event.clientY }
        try {
            await cambiarTema(isDark ? 'light' : 'dark', clickOrigin.current)
        } catch (error) {
            console.error('Error guardando la preferencia de tema:', error)
        } finally {
            clickOrigin.current = null
        }
    }

    const toggle = (
        <Tooltip title="Cambiar tema" placement={collapsed ? 'right' : 'top'}>
            <span>
                <IconButton onClick={handleToggle} disabled={guardandoTema} aria-label="Cambiar tema" aria-pressed={isDark} size="small">
                    <ModeIcon fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    )

    if (collapsed) {
        return <Box sx={{ minHeight: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{toggle}</Box>
    }

    return (
        <Box sx={{ minHeight: 42, display: 'flex', alignItems: 'center', pl: 2, pr: 1 }}>
            <ListItemText primary="Tema oscuro" sx={{ '& .MuiListItemText-primary': { fontSize: '0.8125rem', lineHeight: 1.25 } }} />
            {toggle}
        </Box>
    )
}

export default SidebarThemeToggle
