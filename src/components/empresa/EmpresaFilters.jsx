import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function EmpresaFilters({ loading, puedeAdministrar, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevaEmpresa, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Empresas"
    description="Administración de empresas del sistema"
    loading={loading}
    totalRegistros={totalRegistros}
    busqueda={busqueda}
    filtroEstado={filtroEstado}
    error={error}
    onExportar={onExportar}
    onCreate={onNuevaEmpresa}
    onCambioBusqueda={onCambioBusqueda}
    onCambioEstado={onCambioEstado}
    onCerrarError={onCerrarError}
    searchPlaceholder="Buscar empresa o nombre comercial..."
    searchLabel="Buscar empresa o nombre comercial"
    createLabel="Nueva Empresa"
    canCreate={puedeAdministrar}
  />
}
