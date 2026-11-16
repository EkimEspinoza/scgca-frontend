import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function VariedadesFilters({ puedeAdministrar, loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevaVariedad, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Variedades"
    description={puedeAdministrar ? 'Administración de variedades agrícolas' : 'Consulta de variedades agrícolas'}
    loading={loading}
    totalRegistros={totalRegistros}
    busqueda={busqueda}
    searchValue={busqueda.toLocaleUpperCase()}
    filtroEstado={filtroEstado}
    error={error}
    onExportar={onExportar}
    onCreate={onNuevaVariedad}
    onCambioBusqueda={onCambioBusqueda}
    onCambioEstado={onCambioEstado}
    onCerrarError={onCerrarError}
    searchPlaceholder="Buscar variedad..."
    searchLabel="Buscar variedad"
    createLabel="Nueva variedad"
    canCreate={puedeAdministrar}
    showInlineClear
  />
}
