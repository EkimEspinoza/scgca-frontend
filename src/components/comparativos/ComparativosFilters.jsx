import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function ComparativosFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Comparativos"
    description="Administración de comparativos agrícolas"
    loading={loading}
    totalRegistros={totalRegistros}
    busqueda={busqueda}
    searchValue={busqueda.toUpperCase()}
    filtroEstado={filtroEstado}
    error={error}
    onExportar={onExportar}
    onCreate={onNuevo}
    onCambioBusqueda={onCambioBusqueda}
    onCambioEstado={onCambioEstado}
    onCerrarError={onCerrarError}
    searchPlaceholder="Buscar comparativo..."
    searchLabel="Buscar comparativo"
    createLabel="Nuevo comparativo"
    showInlineClear
  />
}
