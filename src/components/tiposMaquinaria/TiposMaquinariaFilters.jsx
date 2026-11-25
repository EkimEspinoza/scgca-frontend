// Presenta los filtros de TiposMaquinaria.
import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function TiposMaquinariaFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevo, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Tipos de Maquinaria"
    description="Administración de tipos de maquinaria agrícola"
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
    searchPlaceholder="Buscar tipo de maquinaria..."
    searchLabel="Buscar tipo de maquinaria"
    createLabel="Nuevo tipo de maquinaria"
    showResultCount={false}
  />
}
