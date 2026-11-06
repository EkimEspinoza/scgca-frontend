import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Add, Apps, Close, Edit, Save } from '@mui/icons-material'

import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import DataTable from '../../components/common/DataTable'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../context/useAuth'
import {
  actualizarEstadoModulo,
  actualizarModulo,
  crearModulo,
  obtenerModulos,
} from '../../services/accesoService'

const formularioInicial = {
  codigo: '',
  nombre: '',
  grupo: 'Maestros',
  ruta: '',
  orden: 0,
}

function CatalogoModulos() {
  const { user, cargarPerfil } = useAuth()
  const [modulos, setModulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [moduloEditar, setModuloEditar] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [error, setError] = useState('')
  const [notificacion, setNotificacion] = useState({ open: false, mensaje: '', severity: 'success' })

  const cargarModulos = async () => {
    setLoading(true)
    setError('')
    try {
      setModulos(await obtenerModulos())
    } catch (err) {
      console.error('Error cargando el catálogo de módulos:', err)
      setError(err?.message || 'No se pudo cargar el catálogo de módulos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void cargarModulos()
  }, [])

  const modulosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es')
    if (!texto) return modulos
    return modulos.filter((modulo) =>
      [modulo.nombre, modulo.codigo, modulo.grupo, modulo.ruta]
        .some((valor) => valor?.toLocaleLowerCase('es').includes(texto)),
    )
  }, [modulos, busqueda])

  const abrirNuevo = () => {
    setModuloEditar(null)
    setFormulario(formularioInicial)
    setDialogAbierto(true)
  }

  const abrirEdicion = (modulo) => {
    setModuloEditar(modulo)
    setFormulario({
      codigo: modulo.codigo,
      nombre: modulo.nombre,
      grupo: modulo.grupo,
      ruta: modulo.ruta || '',
      orden: modulo.orden ?? 0,
    })
    setDialogAbierto(true)
  }

  const cerrarDialogo = () => {
    if (guardando) return
    setDialogAbierto(false)
    setModuloEditar(null)
    setFormulario(formularioInicial)
  }

  const cambiarCampo = (event) => {
    const { name, value } = event.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
  }

  const guardarModulo = async (event) => {
    event.preventDefault()
    const codigo = formulario.codigo.trim().toUpperCase()
    const ruta = formulario.ruta.trim()

    if (!/^[A-Z][A-Z0-9_]*$/.test(codigo)) {
      setError('El código debe iniciar con una letra y usar solo mayúsculas, números o guion bajo.')
      return
    }
    if (!formulario.nombre.trim() || !formulario.grupo.trim() || !ruta.startsWith('/')) {
      setError('Completa nombre, grupo y una ruta que comience con /.')
      return
    }

    setGuardando(true)
    setError('')
    try {
      if (moduloEditar) {
        await actualizarModulo(moduloEditar.id_modulo, formulario)
        setNotificacion({ open: true, mensaje: 'Módulo actualizado.', severity: 'success' })
      } else {
        await crearModulo({ ...formulario, codigo, estado: true, orden: Number(formulario.orden) })
        setNotificacion({ open: true, mensaje: 'Módulo creado.', severity: 'success' })
      }
      setDialogAbierto(false)
      setModuloEditar(null)
      await cargarModulos()
    } catch (err) {
      console.error('Error guardando módulo:', err)
      setError(err?.message || 'No se pudo guardar el módulo.')
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async (modulo) => {
    const estadoNuevo = !modulo.estado
    setError('')
    try {
      await actualizarEstadoModulo(modulo.id_modulo, estadoNuevo)
      setModulos((actuales) => actuales.map((item) =>
        item.id_modulo === modulo.id_modulo ? { ...item, estado: estadoNuevo } : item,
      ))
      await cargarPerfil(user, { background: true })
      setNotificacion({
        open: true,
        mensaje: estadoNuevo ? 'Módulo reactivado.' : 'Módulo desactivado; sus accesos quedan suspendidos.',
        severity: 'success',
      })
    } catch (err) {
      console.error('Error cambiando estado del módulo:', err)
      setError(err?.message || 'No se pudo cambiar el estado del módulo.')
    }
  }

  const columnas = [
    {
      key: 'nombre',
      label: 'Módulo',
      render: (modulo) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{modulo.nombre}</Typography>
          <Typography variant="caption" color="text.secondary">{modulo.codigo}</Typography>
        </Box>
      ),
    },
    { key: 'grupo', label: 'Grupo' },
    { key: 'ruta', label: 'Ruta' },
    { key: 'orden', label: 'Orden', align: 'center', width: 90 },
    {
      key: 'estado',
      label: 'Estado',
      render: (modulo) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Switch
            size="small"
            checked={Boolean(modulo.estado)}
            onChange={() => cambiarEstado(modulo)}
            inputProps={{ 'aria-label': `${modulo.estado ? 'Desactivar' : 'Activar'} ${modulo.nombre}` }}
          />
          <Typography variant="body2">{modulo.estado ? 'Activo' : 'Inactivo'}</Typography>
        </Box>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'center',
      width: 90,
      render: (modulo) => (
        <Tooltip title="Editar módulo">
          <IconButton size="small" onClick={() => abrirEdicion(modulo)} aria-label={`Editar ${modulo.nombre}`}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ]

  return (
    <CompactModuleTheme>
      <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <PageHeader
          icon={<Apps fontSize="small" />}
          title="Catálogo de módulos"
          description="Administra los módulos disponibles para asignar permisos."
          actionLabel="Nuevo módulo"
          onAction={abrirNuevo}
          actionIcon={<Add />}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, mb: 1, flexShrink: 0 }}>
          <Typography variant="body2" color="text.secondary">{modulos.length} módulos en el catálogo</Typography>
          <TextField
            size="small"
            label="Buscar módulo"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 1, flexShrink: 0 }}>{error}</Alert>}
        <Box sx={{ flex: '1 1 0%', minWidth: 0, minHeight: 0, display: 'flex', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
          <DataTable
            columns={columnas}
            rows={modulosFiltrados}
            loading={loading}
            hasSearch={Boolean(busqueda)}
            emptyMessage="No hay módulos en el catálogo."
            emptySearchMessage="No se encontraron módulos con esa búsqueda."
            getRowKey={(modulo) => modulo.id_modulo}
          />
        </Box>

        <Dialog open={dialogAbierto} onClose={cerrarDialogo} fullWidth maxWidth="sm">
          <Box component="form" onSubmit={guardarModulo}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {moduloEditar ? 'Editar módulo' : 'Nuevo módulo'}
              <IconButton onClick={cerrarDialogo} disabled={guardando} aria-label="Cerrar"><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, pt: 0.5 }}>
                <TextField
                  required
                  label="Código"
                  name="codigo"
                  value={formulario.codigo}
                  onChange={(event) => setFormulario((actual) => ({ ...actual, codigo: event.target.value.toUpperCase() }))}
                  disabled={Boolean(moduloEditar) || guardando}
                  helperText="Mayúsculas, números y guion bajo."
                  inputProps={{ maxLength: 40 }}
                />
                <TextField required label="Nombre" name="nombre" value={formulario.nombre} onChange={cambiarCampo} disabled={guardando} />
                <TextField required label="Grupo de navegación" name="grupo" value={formulario.grupo} onChange={cambiarCampo} disabled={guardando} />
                <TextField required label="Ruta" name="ruta" value={formulario.ruta} onChange={cambiarCampo} disabled={guardando} placeholder="/ruta-del-modulo" />
                <TextField required type="number" label="Orden" name="orden" value={formulario.orden} onChange={cambiarCampo} disabled={guardando} inputProps={{ min: 0, step: 1 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                Registra módulos que ya tengan una pantalla implementada. El código identifica sus permisos.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={cerrarDialogo} disabled={guardando} color="inherit">Cancelar</Button>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        <Snackbar open={notificacion.open} autoHideDuration={3500} onClose={() => setNotificacion((actual) => ({ ...actual, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={notificacion.severity} variant="filled" onClose={() => setNotificacion((actual) => ({ ...actual, open: false }))}>{notificacion.mensaje}</Alert>
        </Snackbar>
      </Box>
    </CompactModuleTheme>
  )
}

export default CatalogoModulos
