// Presenta los filtros de Jornal.
import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function JornalFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Jornal"
    description="Importes de jornal por tipo y periodo de vigencia."
    loading={loading}
    totalRegistros={totalRegistros}
    busqueda={busqueda}
    filtroEstado={filtroEstado}
    error={error}
    onExportar={onExportar}
    onCreate={onNuevo}
    onCambioBusqueda={onCambioBusqueda}
    onCambioEstado={onCambioEstado}
    onCerrarError={onCerrarError}
    searchPlaceholder="Buscar por fechas, tipo o importe..."
    searchLabel="Buscar periodos de jornal"
    createLabel="Nuevo periodo"
    showInlineClear
    showResultCount={false}
  />
}
