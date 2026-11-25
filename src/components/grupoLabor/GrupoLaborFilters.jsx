// Presenta los filtros de GrupoLabor.
import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function GrupoLaborFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Grupo Labor"
    description="Administración de grupos para clasificar labores de mano de obra."
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
    searchPlaceholder="Buscar por código o descripción..."
    searchLabel="Buscar grupo de labor"
    createLabel="Nuevo Grupo Labor"
    showInlineClear
    showResultCount={false}
  />
}
