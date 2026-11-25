// Gestiona sesión, validación y actualización de la contraseña del usuario.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function useCambiarContrasena() {
    const navigate = useNavigate()
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [contrasena, setContrasena] = useState('')
    const [confirmarContrasena, setConfirmarContrasena] = useState('')
    const [mostrarContrasena, setMostrarContrasena] = useState(false)
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [error, setError] = useState('')
    const [exito, setExito] = useState(false)
    useEffect(() => {
        const verificarSesion = async () => {
            try {
                const { data, error: errorSesion } = await supabase.auth.getSession()
                if (errorSesion) { setError('No se pudo verificar la sesión.'); return }
                if (!data.session) setError('No existe una sesión activa. Inicia sesión para cambiar tu contraseña.')
            } catch (err) {
                console.error('Error verificando sesión:', err)
                setError('No se pudo verificar la sesión.')
            } finally { setCargando(false) }
        }
        verificarSesion()
    }, [])
    const handleGuardar = async (event) => {
        event.preventDefault()
        setError('')
        setExito(false)
        if (!contrasena) { setError('Ingresa una contraseña.'); return }
        if (contrasena.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
        if (!confirmarContrasena) { setError('Confirma tu contraseña.'); return }
        if (contrasena !== confirmarContrasena) { setError('Las contraseñas no coinciden.'); return }
        try {
            setGuardando(true)
            const { error: errorActualizar } = await supabase.auth.updateUser({ password: contrasena })
            if (errorActualizar) throw errorActualizar
            setExito(true)
            setContrasena('')
            setConfirmarContrasena('')
            setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
        } catch (err) {
            console.error('Error cambiando contraseña:', err)
            setError(err?.message || 'No se pudo cambiar la contraseña.')
        } finally { setGuardando(false) }
    }
    const handleVolverDashboard = () => navigate('/dashboard')
    return {
        cargando, guardando, contrasena, setContrasena, confirmarContrasena, setConfirmarContrasena,
        mostrarContrasena, setMostrarContrasena, mostrarConfirmacion, setMostrarConfirmacion,
        error, exito, handleGuardar, handleVolverDashboard,
    }
}
