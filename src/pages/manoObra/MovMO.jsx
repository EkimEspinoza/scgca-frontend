// Compone la pantalla MovMO y conecta sus componentes.
import { Alert, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, Typography } from '@mui/material'
import { FactCheck, ListAlt, PendingActions, Person, Summarize } from '@mui/icons-material'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import PageHeader from '../../components/common/PageHeader'
import MovMOFilters from '../../components/movMO/MovMOFilters'
import MovMOTable from '../../components/movMO/MovMOTable'
import MovMOForm from '../../components/movMO/MovMOForm'
import MovMOResumenTable from '../../components/movMO/MovMOResumenTable'
import { useMovMO } from '../../hooks/useMovMO'

export default function MovMO() {
  const {
    pestana, resumen, filas, total, cargando, error, setError,
    busquedaScire, setBusquedaScire, busquedaFinal, setBusquedaFinal,
    estado, setEstado, tipoCentroId, setTipoCentroId, centroCostoPk, setCentroCostoPk,
    grupoLaborId, setGrupoLaborId, opcionesFiltros, cargandoOpciones,
    anio, fechaDesde, fechaHasta, pagina, setPagina, filasPorPagina,
    registroEditar, setRegistroEditar, nuevoRegistroOpen, setNuevoRegistroOpen,
    guardando, registroCambioEstado, setRegistroCambioEstado, cambiandoEstadoId,
    exportandoExcel, revalidandoPendientes, resultadoRevalidacion, setResultadoRevalidacion,
    idEmpresa, cambiarAnio, cambiarFecha, limpiarFiltros, cambiarPestana,
    cambiarFilasPorPagina, guardarEdicion, confirmarCambioEstado,
    exportarExcel, revalidarPendientes,
  } = useMovMO()

  const pestanas = [
    { label: 'Procesados', count: resumen.procesados, icon: <ListAlt fontSize="small" /> },
    { label: 'En proceso', count: resumen.enProceso, icon: <FactCheck fontSize="small" /> },
    { label: 'Pendientes', count: resumen.pendientes, icon: <PendingActions fontSize="small" /> },
    { label: 'Resumen', icon: <Summarize fontSize="small" /> },
  ]

  return <CompactModuleTheme>
    <Box className="app-module-flow tareo-module" sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' }, alignItems: 'start', gap: 2, minWidth: 0 }}>
        <PageHeader icon={<Person fontSize="small" />} title="Movimiento de Mano de Obra" description="Consulta y administra los movimientos de mano de obra procesados, en proceso y pendientes." sx={{ mb: 0, minWidth: 0 }} />
        <Box sx={{ width: 'fit-content', maxWidth: '100%', justifySelf: { xs: 'start', md: 'end' }, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={pestana} onChange={cambiarPestana} aria-label="Estado de movimientos de Mano de Obra" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            {pestanas.map((item, index) => <Tab key={item.label} icon={item.icon} iconPosition="start" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{item.label}{item.count != null && <Badge color={index === pestana ? 'primary' : 'default'} badgeContent={Number(item.count).toLocaleString('es-PE')} max={Number.MAX_SAFE_INTEGER} sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none', px: 1, minWidth: 24, borderRadius: 5, fontWeight: 600 } }} />}</Box>} />)}
          </Tabs>
        </Box>
      </Box>
      <MovMOFilters
        anio={anio} onAnio={cambiarAnio} estado={estado} onEstado={(valor) => { setEstado(valor); setPagina(0) }}
        busquedaScire={busquedaScire} onBusquedaScire={(valor) => { setBusquedaScire(valor); setPagina(0) }}
        busquedaFinal={busquedaFinal} onBusquedaFinal={(valor) => { setBusquedaFinal(valor); setPagina(0) }}
        fechaDesde={fechaDesde} onFechaDesde={(valor) => cambiarFecha('desde', valor)}
        fechaHasta={fechaHasta} onFechaHasta={(valor) => cambiarFecha('hasta', valor)}
        onLimpiar={limpiarFiltros} tipoCentroId={tipoCentroId} onTipoCentro={(valor) => { setTipoCentroId(valor); setCentroCostoPk(''); setPagina(0) }} tiposCentro={opcionesFiltros.tipos}
        centroCostoPk={centroCostoPk} onCentroCosto={(valor) => { setCentroCostoPk(valor); setPagina(0) }} centrosCosto={opcionesFiltros.centros}
        grupoLaborId={grupoLaborId} onGrupoLabor={(valor) => { setGrupoLaborId(valor); setPagina(0) }} gruposLabor={opcionesFiltros.grupos} opcionesCargando={cargandoOpciones}
        mostrarImportar={pestana === 1} mostrarExportar={pestana !== 1} exportando={exportandoExcel} totalExportable={total} onExportar={exportarExcel}
        mostrarRevalidar={pestana === 2} revalidando={revalidandoPendientes} onRevalidar={revalidarPendientes}
        mostrarNuevo={pestana === 0} onNuevo={() => setNuevoRegistroOpen(true)}
        mostrarBusqueda={pestana !== 3} mostrarFiltrosCatalogo={pestana !== 3} />
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {resultadoRevalidacion && <Alert severity="success" onClose={() => setResultadoRevalidacion('')} sx={{ mb: 1 }}>{resultadoRevalidacion}</Alert>}
      {pestana === 3
        ? <MovMOResumenTable filas={filas} cargando={cargando} error="" />
        : <MovMOTable
          filas={filas} cargando={cargando} error="" total={total} pagina={pagina} filasPorPagina={filasPorPagina}
          onPagina={(_event, value) => setPagina(value)} onFilasPorPagina={cambiarFilasPorPagina}
          enProceso={pestana === 1} pendientes={pestana === 2} onEditar={setRegistroEditar} onCambiarEstado={setRegistroCambioEstado} cambiandoEstadoId={cambiandoEstadoId} />}
      <MovMOForm open={Boolean(registroEditar) || nuevoRegistroOpen} registro={registroEditar} modoNuevo={nuevoRegistroOpen} soloAjustesProcesado={pestana === 0} empresaInicial={idEmpresa} fechaInicial={fechaDesde} guardando={guardando} onClose={() => { setRegistroEditar(null); setNuevoRegistroOpen(false) }} onGuardar={guardarEdicion} />
      <Dialog open={Boolean(registroCambioEstado)} onClose={cambiandoEstadoId ? undefined : () => setRegistroCambioEstado(null)} fullWidth maxWidth="xs">
        <DialogTitle>{Number(registroCambioEstado?.estado) === 1 ? 'Desactivar movimiento' : 'Activar movimiento'}</DialogTitle>
        <DialogContent><Typography>¿Deseas {Number(registroCambioEstado?.estado) === 1 ? 'desactivar' : 'activar'} este registro de Mano de Obra?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistroCambioEstado(null)} disabled={Boolean(cambiandoEstadoId)}>Cancelar</Button>
          <Button variant="contained" color={Number(registroCambioEstado?.estado) === 1 ? 'warning' : 'success'} onClick={confirmarCambioEstado} disabled={Boolean(cambiandoEstadoId)}>{cambiandoEstadoId ? 'Guardando…' : 'Confirmar'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  </CompactModuleTheme>
}
