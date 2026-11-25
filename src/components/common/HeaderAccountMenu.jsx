// Presenta las acciones de cuenta desde el menú superior.
import { LockOutlined } from '@mui/icons-material'
import { Divider, Menu, MenuItem } from '@mui/material'

function HeaderAccountMenu({ anchorEl, open, perfil, onClose, onChangePassword, onLogout }) {
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <MenuItem disabled>{perfil?.nombre} {perfil?.apellido}</MenuItem>
            <Divider />
            <Divider />
            <MenuItem onClick={onChangePassword}>
                <LockOutlined fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                Cambiar contraseña
            </MenuItem>
            <Divider />
            <MenuItem onClick={onLogout}>Cerrar sesión</MenuItem>
        </Menu>
    )
}

export default HeaderAccountMenu
