import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function TiposCentroCostoFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Tipos de Centro de Costo"
    description="Administra los tipos utilizados para clasificar los Centros de Costo"
    loading={loading}
    totalRegistros={totalRegistros}
    busqueda={busqueda}
    searchValue={busqueda.toLocaleUpperCase()}
    filtroEstado={filtroEstado}
    error={error}
    onExportar={onExportar}
    onCreate={onNuevo}
    onCambioBusqueda={onCambioBusqueda}
    onCambioEstado={onCambioEstado}
    onCerrarError={onCerrarError}
    searchPlaceholder="Buscar tipo de centro de costo..."
    searchLabel="Buscar tipo de centro de costo"
    createLabel="Nuevo tipo de Centro de Costo"
    showInlineClear
  />
}
