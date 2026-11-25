// Presenta los filtros de EtapasCosto.
import CatalogFiltersToolbar from '../common/CatalogFiltersToolbar'

export default function EtapasCostoFilters({ loading, totalRegistros, busqueda, filtroEstado, error, onExportar, onNuevaEtapa, onCambioBusqueda, onCambioEstado, onCerrarError }) {
  return <CatalogFiltersToolbar
    title="Etapas de Costo"
    description="Administración de etapas utilizadas para clasificar los costos de inversión."
    loading={loading}
    totalRegistros={totalRegistros}
    busqueda={busqueda}
    filtroEstado={filtroEstado}
    error={error}
    onExportar={onExportar}
    onCreate={onNuevaEtapa}
    onCambioBusqueda={onCambioBusqueda}
    onCambioEstado={onCambioEstado}
    onCerrarError={onCerrarError}
    searchPlaceholder="Buscar por código o etapa..."
    searchLabel="Buscar etapa de costo"
    createLabel="Nueva etapa"
    showResultCount={false}
  />
}
