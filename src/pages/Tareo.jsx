import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  AccessTime as TareoIcon,
  FactCheck as PendingIcon,
  ListAlt as LoadedIcon,
} from '@mui/icons-material'

import CompactModuleTheme from '../components/common/CompactModuleTheme'
import PageHeader from '../components/common/PageHeader'
import TareoFilters from '../components/tareo/TareoFilters'
import TareoForm from '../components/tareo/TareoForm'
import TareoTable from '../components/tareo/TareoTable'
import { useAuth } from '../context/useAuth'
import { useEmpresa } from '../context/useEmpresa'
import { supabase } from '../lib/supabase'
import { actualizarEstadoMovimientoTareo, actualizarMovimientoTareo, contarMovimientosTareo, listarMovimientosTareo } from '../services/tareoService'

function Tareo() {
  const { perfil } = useAuth()
  const { empresaActual, empresas } = useEmpresa()
  const [pestana, setPestana] = useState(0)
  const [resumen, setResumen] = useState({ registros: 0, pendientes: 0 })
  const [filas, setFilas] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const anioInicial = String(new Date().getFullYear())
  const [fechaDesde, setFechaDesde] = useState(`${anioInicial}-01-01`)
  const [fechaHasta, setFechaHasta] = useState(`${anioInicial}-12-31`)
  const [anio, setAnio] = useState(anioInicial)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState('')
  const [empresasComplementarias, setEmpresasComplementarias] = useState([])
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(25)
  const [registroEditar, setRegistroEditar] = useState(null)
  const [registroCambioEstado, setRegistroCambioEstado] = useState(null)
  const [errorCambioEstado, setErrorCambioEstado] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null)
  const cargarFilasRef = useRef(null)
  const idEmpresa = empresaActual?.id_empresa ?? null
  const empresasTabla = [...empresas, ...empresasComplementarias]
  const nivelModulo = perfil?.modulos?.find((modulo) => modulo.codigo === 'MOV_TAREO')?.nivel
  const puedeEditar = perfil?.permiso?.nombre === 'ADMIN' || nivelModulo === 'WRITER'

  useEffect(() => {
    let vigente = true
    contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta)
      .then((data) => { if (vigente) setResumen(data) })
      .catch((err) => {
        console.error('Error cargando los totales de Tareo:', err)
        if (vigente) setError(err?.message || 'No se pudieron cargar los totales de Tareo.')
      })
    return () => { vigente = false }
  }, [idEmpresa, fechaDesde, fechaHasta])

  const cargarFilas = useCallback(async () => {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setFilas([])
      setTotal(0)
      setCargando(false)
      return
    }
    setCargando(true)
    setError('')
    try {
      const resultado = await listarMovimientosTareo({
        pendientes: pestana === 1,
        idEmpresa,
        fechaDesde,
        fechaHasta,
        busqueda,
        estado: estadoFiltro,
        pagina,
        filasPorPagina,
      })
      setFilas(resultado.filas)
      setTotal(resultado.total)
    } catch (err) {
      console.error('Error cargando la lista de Tareo:', err)
      setError(err?.message || 'No se pudieron cargar los movimientos de Tareo.')
      setFilas([])
      setTotal(0)
    } finally {
      setCargando(false)
    }
  }, [pestana, idEmpresa, fechaDesde, fechaHasta, busqueda, estadoFiltro, pagina, filasPorPagina])

  useEffect(() => { void cargarFilas() }, [cargarFilas])

  useEffect(() => {
    if (idEmpresa || !filas.length) {
      setEmpresasComplementarias([])
      return undefined
    }

    const empresasConocidas = new Set(empresas.map((empresa) => Number(empresa.id_empresa)))
    const idsFaltantes = [...new Set(filas.map((fila) => Number(fila.id_empresa)).filter((id) => Number.isFinite(id) && !empresasConocidas.has(id)))]
    if (!idsFaltantes.length) {
      setEmpresasComplementarias([])
      return undefined
    }

    let vigente = true
    supabase
      .from('Dim_Empresa')
      .select('id_empresa,nombre_comercial,descripcion')
      .in('id_empresa', idsFaltantes)
      .then(({ data, error: errorEmpresas }) => {
        if (errorEmpresas) throw errorEmpresas
        if (vigente) setEmpresasComplementarias(data ?? [])
      })
      .catch((errorEmpresas) => {
        console.error('No se pudieron resolver los nombres de empresa para Tareo:', errorEmpresas)
        if (vigente) setEmpresasComplementarias([])
      })

    return () => { vigente = false }
  }, [empresas, filas, idEmpresa])

  useEffect(() => {
    cargarFilasRef.current = cargarFilas
  }, [cargarFilas])

  useEffect(() => {
    const filtro = idEmpresa ? { filter: `id_empresa=eq.${Number(idEmpresa)}` } : {}
    const actualizarListas = () => {
      void cargarFilasRef.current?.()
      contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta)
        .then(setResumen)
        .catch((err) => console.error('Error actualizando los totales de Tareo:', err))
    }

    const canal = supabase
      .channel(`mov-tareo-${idEmpresa ?? 'todas'}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mov_tareo', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mov_tareo', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mov_tareo_pendiente', ...filtro }, actualizarListas)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mov_tareo_pendiente', ...filtro }, actualizarListas)
      .subscribe()

    return () => { void supabase.removeChannel(canal) }
  }, [idEmpresa, fechaDesde, fechaHasta])

  const cambiarPestana = (_event, valor) => {
    setPestana(valor)
    setPagina(0)
  }

  const cambiarAnio = (valor) => {
    setAnio(valor)
    setPagina(0)
    setFechaDesde(`${valor}-01-01`)
    setFechaHasta(`${valor}-12-31`)
  }

  const cambiarRangoFecha = (lado, valor) => {
    if (lado === 'desde') setFechaDesde(valor)
    else setFechaHasta(valor)
    const fechaBase = lado === 'desde' ? (valor || fechaHasta) : (valor || fechaDesde)
    setAnio(fechaBase ? fechaBase.slice(0, 4) : String(new Date().getFullYear()))
    setPagina(0)
  }

  const cambiarFilasPorPagina = (event) => {
    setFilasPorPagina(Number(event.target.value))
    setPagina(0)
  }

  const guardarEdicion = async (valores) => {
    if (!registroEditar) return
    setGuardando(true)
    try {
      await actualizarMovimientoTareo(registroEditar.id_mov_tareo, valores, pestana === 1)
      setRegistroEditar(null)
      await cargarFilas()
      const totales = await contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta)
      setResumen(totales)
    } finally {
      setGuardando(false)
    }
  }

  const solicitarCambioEstado = (fila) => {
    setErrorCambioEstado('')
    setRegistroCambioEstado(fila)
  }

  const confirmarCambioEstado = async () => {
    if (!registroCambioEstado) return
    const fila = registroCambioEstado
    const estado = Number(fila.estado) === 1 ? 0 : 1
    setCambiandoEstadoId(fila.id_mov_tareo)

    try {
      await actualizarEstadoMovimientoTareo(fila.id_mov_tareo, estado, pestana === 1)
      setFilas((actuales) => actuales.map((item) => item.id_mov_tareo === fila.id_mov_tareo ? { ...item, estado } : item))
      setRegistroCambioEstado(null)
    } catch (err) {
      console.error('Error actualizando el estado del movimiento de Tareo:', err)
      setErrorCambioEstado(err?.message || 'No se pudo actualizar el estado del movimiento.')
    } finally {
      setCambiandoEstadoId(null)
    }
  }

  return (
    <CompactModuleTheme>
      <Box className="app-module-flow tareo-module" sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', minHeight: 0, maxWidth: 1600, width: '100%', mx: 'auto' }}>
        <Box className="tareo-header">
          <PageHeader
            icon={<TareoIcon sx={{ color: 'primary.main' }} />}
            title="Tareo de maquinaria"
            description="Consulta las horas trabajadas por maquinaria en los centros de costo de inversión."
            sx={{ mb: 0, minWidth: 0 }}
          />
          <Box className="tareo-tabs">
            <Tabs value={pestana} onChange={cambiarPestana} aria-label="Listas de Tareo" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
              <Tab icon={<LoadedIcon sx={{ fontSize: 18 }} />} iconPosition="start" aria-label={`Cargados: ${resumen.registros.toLocaleString('es-PE')} según filtros`} label={<Tooltip title="Registros cargados según empresa, año y fechas seleccionadas"><Badge className="tareo-tab-count tareo-tab-count--loaded" badgeContent={resumen.registros.toLocaleString('es-PE')} max={999999}>Cargados</Badge></Tooltip>} />
              <Tab icon={<PendingIcon sx={{ fontSize: 18 }} />} iconPosition="start" aria-label={`Pendientes: ${resumen.pendientes.toLocaleString('es-PE')} según filtros`} label={<Tooltip title="Pendientes según empresa, año y fechas seleccionadas"><Badge className={`tareo-tab-count ${resumen.pendientes > 0 ? 'tareo-tab-count--pending' : 'tareo-tab-count--pending-zero'}`} badgeContent={resumen.pendientes.toLocaleString('es-PE')} max={999999}>Pendientes</Badge></Tooltip>} />
            </Tabs>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ minWidth: 0, flexShrink: 0 }}>
          <TareoFilters
            busqueda={busqueda}
            onBusqueda={(valor) => { setBusqueda(valor); setPagina(0) }}
            estado={estadoFiltro}
            onEstadoChange={(valor) => { setEstadoFiltro(valor); setPagina(0) }}
            anio={anio}
            onAnioChange={cambiarAnio}
            onCargarArchivo={(file) => setArchivoSeleccionado(file.name)}
            fechaDesde={fechaDesde}
            onFechaDesde={(valor) => cambiarRangoFecha('desde', valor)}
            fechaHasta={fechaHasta}
            onFechaHasta={(valor) => cambiarRangoFecha('hasta', valor)}
          />
        </Box>

        <Snackbar open={Boolean(archivoSeleccionado)} autoHideDuration={5000} onClose={() => setArchivoSeleccionado('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="info" onClose={() => setArchivoSeleccionado('')} sx={{ width: '100%' }}>
            Archivo seleccionado: {archivoSeleccionado}. La importación y validación de Excel aún está pendiente.
          </Alert>
        </Snackbar>

        <TareoTable
          filas={filas}
          empresas={empresasTabla}
          mostrarEmpresa={!idEmpresa}
          pendientes={pestana === 1}
          cargando={cargando}
          total={total}
          pagina={pagina}
          filasPorPagina={filasPorPagina}
          onCambiarPagina={(_event, valor) => setPagina(valor)}
          onCambiarFilasPorPagina={cambiarFilasPorPagina}
          puedeEditar={puedeEditar}
          onEditar={setRegistroEditar}
          onCambiarEstado={solicitarCambioEstado}
          cambiandoEstadoId={cambiandoEstadoId}
        />
        <Dialog open={Boolean(registroCambioEstado)} onClose={cambiandoEstadoId ? undefined : () => setRegistroCambioEstado(null)} fullWidth maxWidth="xs">
          <DialogTitle>{Number(registroCambioEstado?.estado) === 1 ? 'Desactivar tareo' : 'Activar tareo'}</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Deseas {Number(registroCambioEstado?.estado) === 1 ? 'desactivar' : 'activar'} el tareo {registroCambioEstado?.nro_parte}?
            </Typography>
            {errorCambioEstado && <Alert severity="error" sx={{ mt: 1.5 }}>{errorCambioEstado}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegistroCambioEstado(null)} disabled={Boolean(cambiandoEstadoId)}>Cancelar</Button>
            <Button
              variant="contained"
              color={Number(registroCambioEstado?.estado) === 1 ? 'warning' : 'success'}
              onClick={confirmarCambioEstado}
              disabled={Boolean(cambiandoEstadoId)}
            >
              {cambiandoEstadoId ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </Dialog>
        <TareoForm
          open={Boolean(registroEditar)}
          registro={registroEditar}
          pendiente={pestana === 1}
          guardando={guardando}
          onClose={() => setRegistroEditar(null)}
          onGuardar={guardarEdicion}
        />
      </Box>
    </CompactModuleTheme>
  )
}

export default Tareo
