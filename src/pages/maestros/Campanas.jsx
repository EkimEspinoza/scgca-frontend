// Compone la pantalla Campanas y conecta sus componentes.
import {Alert,Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,Paper,Snackbar,Stack,Typography} from '@mui/material'
import {Add as AddIcon,Campaign,TableView as TableViewIcon} from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'

import Pagination from '../../components/common/Pagination'
import CampanaFilters from '../../components/campanas/CampanaFilters'
import CampanaForm from '../../components/campanas/CampanaForm'
import CampanaTable from '../../components/campanas/CampanaTable'
import useCampana from '../../hooks/useCampana'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import PageHeader from '../../components/common/PageHeader'


function Campanas() {

    // ============================================================
    // CONTEXTO
    // ============================================================

    const [searchParams] = useSearchParams()
    const codCcPkContextual = searchParams.get('cod_cc_pk',) ?? ''

    // ============================================================
    // HOOK PRINCIPAL
    // ============================================================

    const {

        exportandoExcel,
        handleExportarExcel,

        empresas,
        centrosCosto,
        centrosCostoFiltros,
        ultimaCampanaCentroCosto,

        //--------------------------------------------------------
        // Cargas
        // --------------------------------------------------------

        loading,
        loadingEmpresas,
        loadingCentrosCosto,
        loadingCentrosCostoFiltros,

        // --------------------------------------------------------
        // Filtros
        // --------------------------------------------------------

        busqueda,
        handleBusquedaChange,

        empresaGlobalId,
        tipoCentroCostoFiltro,
        centroCostoFiltro,
        estadoFiltro,
        cierreFiltro,
        handleTipoCentroCostoFiltroChange,
        handleCentroCostoFiltroChange,
        handleEstadoFiltroChange,
        handleCierreFiltroChange,
        limpiarFiltros,
        campanasFiltradas,

        // --------------------------------------------------------
        // Paginación
        // --------------------------------------------------------

        pagina,
        setPagina,
        registrosPorPagina,
        setRegistrosPorPagina,
        campanasPaginadas,

        // --------------------------------------------------------
        // Formulario
        // --------------------------------------------------------

        formulario,
        modalAbierto,
        modoEdicion,
        errorFormulario,
        setErrorFormulario,

        // --------------------------------------------------------
        // Operaciones
        // --------------------------------------------------------

        guardando,
        eliminando,
        campanaCambioEstado,
        cambiandoEstado,

        // --------------------------------------------------------
        // Contexto
        // --------------------------------------------------------

        esModoContextual,

        // --------------------------------------------------------
        // Acciones
        // --------------------------------------------------------

        abrirNuevo,
        abrirEditar,
        cerrarModal,
        handleChange,
        handleBooleanChange,
        handleGuardar,
        handleEliminar,
        solicitarCambioEstado,
        solicitarCambioCierre,
        cerrarConfirmacionCambioEstado,
        confirmarCambioEstado,
        // --------------------------------------------------------
        // Mensajes
        // --------------------------------------------------------

        snackbar,
        cerrarSnackbar } = useCampana({ codCcPkContextual })

    /* ============================================================
     * CAMBIO DE CAMPOS DEL FORMULARIO
     * CampanaForm utiliza:
     *     onChange('campo', valor)
     * mientras que useCampana utiliza:
     *     handleChange(event)
     * Aquí hacemos el puente entre ambos componentes.
     * ============================================================
     */

    function handleFormularioChange(campo, valor) { handleChange({ target: { name: campo, value: valor } }) }
    // ============================================================
    // CAMBIO DE ESTADO
    // ============================================================

    function handleCambiarEstado() { handleBooleanChange('estado', !formulario.estado) }
    // ============================================================
    // CAMBIO DE CIERRE
    // ============================================================

    function handleCambiarCierre() { handleBooleanChange('cierre_camp', !formulario.cierre_camp) }
    // ============================================================
    // PAGINACIÓN
    // ============================================================
    function handleChangePagina(_event, nuevaPagina) { setPagina(nuevaPagina) }

    function handleChangeRegistrosPorPagina(event) {
        setRegistrosPorPagina(Number(event.target.value))
        setPagina(0)
    }

    /* ============================================================
     * RENDER
     * ============================================================
     */
    return (
      <CompactModuleTheme>
        <Box className="app-module-flow" sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* ====================================================
                ENCABEZADO
            ===================================================== */}

            <Box
                sx={{
                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between',
                    gap: 1.5, flexShrink: 0, minWidth: 0,
                }}
            >

                {/* =================================================
                TÍTULO
                ================================================== */}
                <PageHeader
                    icon={<Campaign />}
                    title="Campañas"
                    description="Administración de campañas asociadas al Centro de Costo seleccionado."
                    sx={{ mb: 0, flex: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
                    <Button className="app-excel-action-button" variant="outlined" color="inherit" startIcon={<TableViewIcon />} onClick={handleExportarExcel} disabled={exportandoExcel || loading || loadingEmpresas || loadingCentrosCosto}>
                        {exportandoExcel ? 'Exportando...' : 'Exportar Excel'}
                    </Button>
                    <Button className="app-create-action-button" variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo} disabled={loading}>Nueva Campaña</Button>
                </Box>
            </Box>

            {/* ====================================================
                FILTROS
            ===================================================== */}
                <CampanaFilters

                    tipoCentroCostoSeleccionado={tipoCentroCostoFiltro}
                    centrosCosto={centrosCostoFiltros}
                    empresaSeleccionada={empresaGlobalId}
                    centroCostoSeleccionado={centroCostoFiltro}
                    estadoFiltro={estadoFiltro}
                    cierreFiltro={cierreFiltro}
                    busqueda={busqueda}

                    onTipoCentroCostoChange={handleTipoCentroCostoFiltroChange}
                    onCentroCostoChange={handleCentroCostoFiltroChange}
                    onEstadoChange={handleEstadoFiltroChange}
                    onCierreChange={handleCierreFiltroChange}
                    onBusquedaChange={handleBusquedaChange}
                    onLimpiarFiltros={limpiarFiltros}

                    loading={loading || loadingCentrosCostoFiltros || eliminando}
                />
            {/* ====================================================
                TABLA
            ===================================================== */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column',
                    border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper'
                }}>

                <CampanaTable
                    campanas={campanasPaginadas}
                    loading={loading}
                    eliminando={eliminando}
                    cambiandoEstado={cambiandoEstado}
                    emptyMessage={esModoContextual ? 'No existen campañas registradas para este Centro de Costo.' : 'No existen campañas registradas.'}
                    emptySearchMessage={'No se encontraron campañas para la búsqueda.'}
                    hasSearch={Boolean(busqueda.trim())}
                    onEditar={abrirEditar}
                    onCambiarEstado={solicitarCambioEstado}
                    onCambiarCierre={solicitarCambioCierre}
                    onEliminar={handleEliminar}
                />
                <Box sx={{ flexShrink: 0, '& .MuiTablePagination-toolbar': { minHeight: 48, px: 1 }, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' } }}>
                    <Pagination
                        total={campanasFiltradas.length}
                        pagina={pagina}
                        registrosPorPagina={registrosPorPagina}
                        onPageChange={handleChangePagina}
                        onRowsPerPageChange={handleChangeRegistrosPorPagina}
                        leadingContent={`${campanasFiltradas.length} ${campanasFiltradas.length === 1 ? 'registro encontrado' : 'registros encontrados'}`}
                    />
                </Box>
            </Paper>

            {/* ====================================================
                MODAL
            ===================================================== */}
            <Dialog open={modalAbierto} onClose={cerrarModal} fullWidth maxWidth="md">
                <DialogTitle sx={{ py: 1.25, fontWeight: 700 }}>
                    {modoEdicion ? 'Editar campaña' : 'Nueva campaña'}
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Stack spacing={1.5}>
                        {errorFormulario && (
                            <Alert
                                severity="error"
                                onClose={() =>
                                    setErrorFormulario(
                                        '',)}>
                                {errorFormulario}
                            </Alert>
                        )}
                        <CampanaForm
                            formulario={formulario}
                            empresas={empresas}
                            centrosCosto={centrosCosto}
                            ultimaCampanaCentroCosto={ultimaCampanaCentroCosto}
                            cargandoHistorial={loading}
                            error=""
                            guardando={guardando}
                            modoEdicion={modoEdicion}
                            modoContextual={esModoContextual}

                            onChange={handleFormularioChange}
                            onCambiarEstado={handleCambiarEstado}
                            onCambiarCierre={handleCambiarCierre}
                            onGuardar={handleGuardar}
                            onCancelar={cerrarModal}
                        />
                    </Stack>
                </DialogContent>
            </Dialog>
            <Dialog
                open={Boolean(campanaCambioEstado)}
                onClose={cerrarConfirmacionCambioEstado}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    {campanaCambioEstado?.tipoCambio === 'cierre' ? (campanaCambioEstado.nuevoCierre ? 'Cerrar campaña' : 'Reabrir campaña') : campanaCambioEstado?.nuevoEstado ? 'Reactivar campaña' : 'Desactivar campaña'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {campanaCambioEstado?.tipoCambio === 'cierre'
                            ? `¿Deseas ${campanaCambioEstado.nuevoCierre ? 'cerrar' : 'reabrir'} la campaña "${campanaCambioEstado.nombre_campana}"?`
                            : campanaCambioEstado?.nuevoEstado
                            ? `¿Deseas reactivar "${campanaCambioEstado?.nombre_campana}"?`
                            : `¿Deseas desactivar "${campanaCambioEstado?.nombre_campana}"? El registro se conservará en la base de datos.`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarConfirmacionCambioEstado} disabled={cambiandoEstado}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color={campanaCambioEstado?.tipoCambio === 'cierre' ? 'warning' : campanaCambioEstado?.nuevoEstado ? 'success' : 'warning'}
                        onClick={confirmarCambioEstado}
                        disabled={cambiandoEstado}
                    >
                        {cambiandoEstado ? 'Guardando...' : campanaCambioEstado?.tipoCambio === 'cierre' ? (campanaCambioEstado.nuevoCierre ? 'Cerrar' : 'Reabrir') : campanaCambioEstado?.nuevoEstado ? 'Reactivar' : 'Desactivar'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ====================================================
                NOTIFICACIÓN
            ===================================================== */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={cerrarSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={cerrarSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
      </CompactModuleTheme>
    )
}
export default Campanas
