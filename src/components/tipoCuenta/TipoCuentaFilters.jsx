// Presenta los filtros y acciones del catálogo Tipo de Cuenta.
import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function TipoCuentaFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Tipo de Cuenta"
    description="Administración de tipos de cuenta del módulo Servicios."
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
    searchLabel="Buscar tipo de cuenta"
    createLabel="Nuevo Tipo de Cuenta"
    showInlineClear
    showResultCount={false}
  />
}
