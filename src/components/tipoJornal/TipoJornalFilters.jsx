import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function TipoJornalFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Tipo de Jornal"
    description="Administración de tipos de jornal para mano de obra."
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
    searchLabel="Buscar tipo de jornal"
    createLabel="Nuevo Tipo de Jornal"
    showInlineClear
  />
}
