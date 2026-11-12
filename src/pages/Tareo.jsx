import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Tab,
  Tabs,
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
import { actualizarMovimientoTareo, contarMovimientosTareo, listarMovimientosTareo } from '../services/tareoService'

function Tareo() {
  const { perfil } = useAuth()
  const { empresaActual } = useEmpresa()
  const [pestana, setPestana] = useState(0)
  const [resumen, setResumen] = useState({ registros: 0, pendientes: 0 })
  const [filas, setFilas] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(25)
  const [registroEditar, setRegistroEditar] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const cargarFilasRef = useRef(null)
  const idEmpresa = empresaActual?.id_empresa ?? null
  const nivelModulo = perfil?.modulos?.find((modulo) => modulo.codigo === 'MOV_TAREO')?.nivel
  const puedeEditar = perfil?.permiso?.nombre === 'ADMIN' || nivelModulo === 'WRITER'

  useEffect(() => {
    let vigente = true
    contarMovimientosTareo(idEmpresa)
      .then((data) => { if (vigente) setResumen(data) })
      .catch((err) => {
        console.error('Error cargando los totales de Tareo:', err)
        if (vigente) setError(err?.message || 'No se pudieron cargar los totales de Tareo.')
      })
    return () => { vigente = false }
  }, [idEmpresa])

  const cargarFilas = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const resultado = await listarMovimientosTareo({
        pendientes: pestana === 1,
        idEmpresa,
        fechaDesde,
        fechaHasta,
        busqueda,
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
  }, [pestana, idEmpresa, fechaDesde, fechaHasta, busqueda, pagina, filasPorPagina])

  useEffect(() => { void cargarFilas() }, [cargarFilas])

  useEffect(() => {
    cargarFilasRef.current = cargarFilas
  }, [cargarFilas])

  useEffect(() => {
    const filtro = idEmpresa ? { filter: `id_empresa=eq.${Number(idEmpresa)}` } : {}
    const actualizarListas = () => {
      void cargarFilasRef.current?.()
      contarMovimientosTareo(idEmpresa)
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
  }, [idEmpresa])

  const cambiarPestana = (_event, valor) => {
    setPestana(valor)
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
      await actualizarMovimientoTareo(registroEditar.id_mov_tareo, valores)
      setRegistroEditar(null)
      await cargarFilas()
      const totales = await contarMovimientosTareo(idEmpresa)
      setResumen(totales)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <CompactModuleTheme>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: '100%', minHeight: 0 }}>
        <PageHeader
          icon={<TareoIcon />}
          title="Tareo de maquinaria"
          description="Consulta las horas trabajadas por maquinaria en los centros de costo de inversión."
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Tabs value={pestana} onChange={cambiarPestana} aria-label="Listas de Tareo">
            <Tab icon={<LoadedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Cargados (${resumen.registros.toLocaleString('es-PE')})`} />
            <Tab icon={<PendingIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Pendientes (${resumen.pendientes.toLocaleString('es-PE')})`} />
          </Tabs>
        </Box>

        <TareoFilters
          busqueda={busqueda}
          onBusqueda={(valor) => { setBusqueda(valor); setPagina(0) }}
          fechaDesde={fechaDesde}
          onFechaDesde={(valor) => { setFechaDesde(valor); setPagina(0) }}
          fechaHasta={fechaHasta}
          onFechaHasta={(valor) => { setFechaHasta(valor); setPagina(0) }}
        />

        <TareoTable
          filas={filas}
          pendientes={pestana === 1}
          cargando={cargando}
          total={total}
          pagina={pagina}
          filasPorPagina={filasPorPagina}
          onCambiarPagina={(_event, valor) => setPagina(valor)}
          onCambiarFilasPorPagina={cambiarFilasPorPagina}
          puedeEditar={puedeEditar}
          onEditar={setRegistroEditar}
        />
        <TareoForm
          open={Boolean(registroEditar)}
          registro={registroEditar}
          guardando={guardando}
          onClose={() => setRegistroEditar(null)}
          onGuardar={guardarEdicion}
        />
      </Box>
    </CompactModuleTheme>
  )
}

export default Tareo
