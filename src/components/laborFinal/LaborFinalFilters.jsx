import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function LaborFinalFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Labor Final"
    description="Administración de labores finales asociadas a los grupos de mano de obra."
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
    searchPlaceholder="Buscar por código, descripción o grupo..."
    searchLabel="Buscar labor final"
    createLabel="Nueva Labor Final"
    showInlineClear
  />
}
