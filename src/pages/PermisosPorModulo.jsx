import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { Save, Security } from '@mui/icons-material'

import CompactModuleTheme from '../components/common/CompactModuleTheme'
import DataTable from '../components/common/DataTable'
import PageHeader from '../components/common/PageHeader'
import { obtenerEtiquetaPermiso } from '../components/usuarios/usuarioRules'
import {
  obtenerAsignacionesUsuario,
  obtenerModulos,
  obtenerUsuariosParaPermisos,
  guardarPermisosPorModulo,
} from '../services/accesoService'

function nombreUsuario(usuario) {
  return [usuario.nombre, usuario.apellido].filter(Boolean).join(' ')
}

function PermisosPorModulo() {
  const [usuarios, setUsuarios] = useState([])
  const [modulos, setModulos] = useState([])
  const [usuarioId, setUsuarioId] = useState('')
  const [niveles, setNiveles] = useState({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [notificacion, setNotificacion] = useState({ open: false, mensaje: '', severity: 'success' })

  const usuarioSeleccionado = useMemo(
    () => usuarios.find((usuario) => String(usuario.id_usuario) === String(usuarioId)),
    [usuarios, usuarioId],
  )
  const esAdmin = usuarioSeleccionado?.permiso?.nombre === 'ADMIN'

  const cargarCatalogo = async () => {
    setLoading(true)
    setError('')
    try {
      const [listaUsuarios, listaModulos] = await Promise.all([
        obtenerUsuariosParaPermisos(),
        obtenerModulos(),
      ])
      setUsuarios(listaUsuarios)
      setModulos(listaModulos)
      const seleccionado = listaUsuarios.find((usuario) => usuario.permiso?.nombre !== 'ADMIN') ?? listaUsuarios[0]
      setUsuarioId((actual) => actual || (seleccionado ? String(seleccionado.id_usuario) : ''))
    } catch (err) {
      console.error('Error cargando datos de permisos:', err)
      setError(err?.message || 'No se pudieron cargar los datos de permisos.')
    } finally {
      setLoading(false)
    }
  }

  const cargarAsignaciones = async (id) => {
    if (!id) {
      setNiveles({})
      return
    }
    setError('')
    try {
      const asignaciones = await obtenerAsignacionesUsuario(id)
      setNiveles(Object.fromEntries(
        asignaciones.filter((item) => item.estado).map((item) => [item.id_modulo, item.nivel]),
      ))
    } catch (err) {
      console.error('Error cargando asignaciones de permisos:', err)
      setError(err?.message || 'No se pudieron cargar los permisos del usuario.')
      setNiveles({})
    }
  }

  useEffect(() => { void cargarCatalogo() }, [])
  useEffect(() => { void cargarAsignaciones(usuarioId) }, [usuarioId])

  const guardar = async () => {
    if (!usuarioId || esAdmin) return
    setGuardando(true)
    setError('')
    try {
      await guardarPermisosPorModulo(usuarioId, modulos.map((modulo) => ({
        id_modulo: modulo.id_modulo,
        nivel: modulo.estado ? (niveles[modulo.id_modulo] ?? 'SIN_ACCESO') : 'SIN_ACCESO',
      })))
      setNotificacion({ open: true, mensaje: 'Permisos por módulo guardados.', severity: 'success' })
      await cargarAsignaciones(usuarioId)
    } catch (err) {
      console.error('Error guardando permisos por módulo:', err)
      setError(err?.message || 'No se pudieron guardar los permisos. Vuelve a cargar y revisa el estado actual.')
    } finally {
      setGuardando(false)
    }
  }

  const columnas = [
    {
      key: 'nombre',
      label: 'Módulo',
      render: (modulo) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{modulo.nombre}</Typography>
          <Typography variant="caption" color="text.secondary">{modulo.grupo} · {modulo.codigo}</Typography>
        </Box>
      ),
    },
    { key: 'ruta', label: 'Ruta' },
    {
      key: 'nivel',
      label: 'Acceso asignado',
      width: 220,
      render: (modulo) => (
        <TextField
          select
          fullWidth
          size="small"
          value={modulo.estado ? (niveles[modulo.id_modulo] ?? 'SIN_ACCESO') : 'SIN_ACCESO'}
          onChange={(event) => setNiveles((actual) => ({ ...actual, [modulo.id_modulo]: event.target.value }))}
          disabled={loading || guardando || esAdmin || !modulo.estado}
          aria-label={`Acceso a ${modulo.nombre}`}
        >
          <MenuItem value="SIN_ACCESO">Sin acceso</MenuItem>
          <MenuItem value="QUERY">QUERY · consultar y exportar</MenuItem>
          <MenuItem value="WRITER">WRITER · consultar y administrar</MenuItem>
        </TextField>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      width: 100,
      render: (modulo) => <Typography variant="body2" color={modulo.estado ? 'success.main' : 'text.secondary'}>{modulo.estado ? 'Activo' : 'Inactivo'}</Typography>,
    },
  ]

  return (
    <CompactModuleTheme>
      <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          icon={<Security fontSize="small" />}
          title="Permisos por módulo"
          description="Define qué módulos puede consultar o administrar cada usuario."
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexShrink: 0 }}>
          <TextField
            select
            size="small"
            label="Usuario"
            value={usuarioId}
            onChange={(event) => setUsuarioId(event.target.value)}
            disabled={loading || usuarios.length === 0}
            sx={{ minWidth: { xs: '100%', sm: 360 } }}
          >
            {usuarios.map((usuario) => (
              <MenuItem key={usuario.id_usuario} value={String(usuario.id_usuario)}>
                {nombreUsuario(usuario)} · {obtenerEtiquetaPermiso(usuario.permiso?.nombre)} · {usuario.estado ? 'Activo' : 'Inactivo'}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<Save />} onClick={guardar} disabled={loading || guardando || !usuarioId || esAdmin}>
            {guardando ? 'Guardando…' : 'Guardar permisos'}
          </Button>
        </Box>

        {esAdmin && <Alert severity="info" sx={{ mb: 1 }}>El rol ADMIN conserva acceso total; sus permisos no se asignan por módulo.</Alert>}
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        <Box sx={{ flex: '1 1 0%', minWidth: 0, minHeight: 0, display: 'flex', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
          <DataTable
            columns={columnas}
            rows={modulos}
            loading={loading}
            emptyMessage="No hay módulos registrados en el catálogo."
            getRowKey={(modulo) => modulo.id_modulo}
          />
        </Box>

        <Snackbar open={notificacion.open} autoHideDuration={3500} onClose={() => setNotificacion((actual) => ({ ...actual, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={notificacion.severity} variant="filled" onClose={() => setNotificacion((actual) => ({ ...actual, open: false }))}>{notificacion.mensaje}</Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}

export default PermisosPorModulo
