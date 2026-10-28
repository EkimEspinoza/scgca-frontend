import {Alert,Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,Paper,Snackbar,Stack,Typography} from '@mui/material'
import {Add as AddIcon,Campaign,TableView as TableViewIcon} from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'

import Pagination from '../components/common/Pagination'
import CampanaFilters from '../components/campanas/CampanaFilters'
import CampanaForm from '../components/campanas/CampanaForm'
import CampanaTable from '../components/campanas/CampanaTable'
import useCampana from '../hooks/useCampana'
import CompactModuleTheme from '../components/common/CompactModuleTheme'


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
        ultimaCampanaCentroCosto,

        //--------------------------------------------------------
        // Cargas
        // --------------------------------------------------------

        loading,
        loadingEmpresas,
        loadingCentrosCosto,

        // --------------------------------------------------------
        // Filtros
        // --------------------------------------------------------

        busqueda,
        handleBusquedaChange,

        empresaFiltro,
        tipoCentroCostoFiltro,
        centroCostoFiltro,
        estadoFiltro,
        cierreFiltro,
        handleEmpresaFiltroChange,
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
        <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* ====================================================
                ENCABEZADO
            ===================================================== */}

            <Box
                sx={{
                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between',
                    gap: 1.5, flexShrink: 0, mb: 0.75, minWidth: 0,
                }}
            >

                {/* =================================================
                TÍTULO
                ================================================== */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                    <Box sx={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, backgroundColor: 'primary.light', color: 'primary.dark', opacity: 0.95 }}>
                        <Campaign sx={{ fontSize: 27 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography component="h1" sx={{ fontSize: { xs: '1.25rem', sm: '1.375rem' }, lineHeight: 1.2, fontWeight: 700, color: 'text.primary' }}>
                            Campañas
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Administración de campañas asociadas al Centro de Costo seleccionado.
                        </Typography>
                    </Box>
                </Box>
                {/* =================================================
                ACCIONES
                ================================================== */}

                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'row' }, gap: 1, width: { xs: '100%', sm: 'auto' }, flexShrink: 0, minWidth: 0 }}>
                    {/* =================================================
                    EXPORTAR EXCEL
                    ============================================== */}

                    <Button
                        variant="outlined"
                        startIcon={<TableViewIcon />}
                        onClick={handleExportarExcel}
                        disabled={exportandoExcel || loading || loadingEmpresas || loadingCentrosCosto}
                        sx={{ minWidth: 0, flex: { xs: '1 1 0%', sm: '0 1 auto' }, height: 36, whiteSpace: 'nowrap', fontSize: { xs: '0.6875rem', sm: '0.75rem' }, px: { xs: 0.75, sm: 1.5 }, fontWeight: 700, borderRadius: 1, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                    >
                        {exportandoExcel ? 'Exportando...' : 'Exportar Excel'}
                    </Button>

                    {/* =============================================
                    NUEVA CAMPAÑA
                    ============================================== */}

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={abrirNuevo}
                        disabled={loading}
                        sx={{ minWidth: 0, flex: { xs: '1 1 0%', sm: '0 1 auto' }, height: 36, whiteSpace: 'nowrap', fontSize: { xs: '0.6875rem', sm: '0.75rem' }, px: { xs: 0.75, sm: 1.5 }, flexShrink: 0, fontWeight: 700, borderRadius: 1, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                        Nueva Campaña
                    </Button>

                </Box>

            </Box>

            {/* ====================================================
                FILTROS
            ===================================================== */}
            <Paper elevation={0} sx={{ flexShrink: 0, minWidth: 0, mb: 0.75 }}>

                <CampanaFilters

                    empresas={empresas}
                    tipoCentroCostoSeleccionado={tipoCentroCostoFiltro}
                    centrosCosto={centrosCosto}
                    empresaSeleccionada={empresaFiltro}
                    centroCostoSeleccionado={centroCostoFiltro}
                    estadoFiltro={estadoFiltro}
                    cierreFiltro={cierreFiltro}
                    busqueda={busqueda}

                    onEmpresaChange={handleEmpresaFiltroChange}
                    onTipoCentroCostoChange={handleTipoCentroCostoFiltroChange}
                    onCentroCostoChange={handleCentroCostoFiltroChange}
                    onEstadoChange={handleEstadoFiltroChange}
                    onCierreChange={handleCierreFiltroChange}
                    onBusquedaChange={handleBusquedaChange}
                    onLimpiarFiltros={limpiarFiltros}

                    loading={loading || loadingEmpresas || loadingCentrosCosto || eliminando}
                />

            </Paper>
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
                    onEliminar={handleEliminar}
                />
                <Box sx={{ flexShrink: 0, '& .MuiTablePagination-toolbar': { minHeight: 48, px: 1 }, '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.75rem' } }}>
                    <Pagination
                        total={campanasFiltradas.length}
                        pagina={pagina}
                        registrosPorPagina={registrosPorPagina}
                        onPageChange={handleChangePagina}
                        onRowsPerPageChange={handleChangeRegistrosPorPagina}
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
                    {campanaCambioEstado?.nuevoEstado ? 'Reactivar campaña' : 'Desactivar campaña'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {campanaCambioEstado?.nuevoEstado
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
                        color={campanaCambioEstado?.nuevoEstado ? 'success' : 'warning'}
                        onClick={confirmarCambioEstado}
                        disabled={cambiandoEstado}
                    >
                        {cambiandoEstado ? 'Guardando...' : campanaCambioEstado?.nuevoEstado ? 'Reactivar' : 'Desactivar'}
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
