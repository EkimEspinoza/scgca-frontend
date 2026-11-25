// Presenta los filtros y acciones del catálogo Cuenta Comparativo.
import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function CuentaComparativoFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Cuenta Comparativo"
    description="Administra las cuentas vinculadas a los tipos de cuenta de Servicios."
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
    searchPlaceholder="Buscar por código, cuenta o tipo..."
    searchLabel="Buscar cuenta comparativo"
    createLabel="Nueva Cuenta Comparativo"
    showInlineClear
    showResultCount={false}
  />
}
