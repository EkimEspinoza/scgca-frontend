
import useTipoCambio from '../../hooks/useTipoCambio'
import { formatearPeriodo } from '../../hooks/tipoCambioFormatters'
import { Alert, Box, Button, CircularProgress, IconButton, Paper, Snackbar, Typography } from '@mui/material'
import { CloudDownload, CurrencyExchange } from '@mui/icons-material'
import SearchInput from '../../components/common/SearchInput'
import PageHeader from '../../components/common/PageHeader'
import CompactModuleTheme from '../../components/common/CompactModuleTheme'
import { ActiveFilterChips } from '../../components/common/FiltersToolbar'
import TipoCambioTable from '../../components/TipoCambioTable'
import TipoCambioDialogs from '../../components/TipoCambioDialogs'

function TipoCambio() {
    const {
        siguientePeriodo, propuesta, setPropuesta, tipoSeleccionado,
        formulario, erroresFormulario, loading, consultando, guardando, error, setError, mensaje, setMensaje,
        dialogEdicionOpen, dialogPropuestaOpen, setDialogPropuestaOpen,
        busqueda, pagina, registrosPorPagina, tiposCambioFiltrados, tiposCambioPaginados,
        handleCambioBusqueda, handleChangePagina, handleChangeRegistrosPorPagina,
        handlePrepararIngresoManual, handleConfirmarPropuesta, handleEditarTipo, handleCerrarEdicion,
        handleChangeFormulario, handleGuardarEdicion,
    } = useTipoCambio()

    const handleCerrarMensaje = () => setMensaje('')
    const handleCerrarError = () => setError('')

    const totalRegistros = tiposCambioFiltrados.length
    // RENDER
    // =========================================================
    return (
        <CompactModuleTheme>
        <Box
            className="app-module-flow"
            sx={{
                width: '100%',
                height: '100%',
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                pb: 1
            }}
        >
            <PageHeader
                icon={<CurrencyExchange />}
                title="Tipo de cambio"
                description="Consulta y administra los tipos de cambio registrados por período."
                sx={{ mb: 0 }}
            />
            {/* ENCABEZADO */}

            {/* TARJETAS DE PERÍODOS */}
            
            {/* INGRESO MANUAL */}
            
            {/* Contenedor horizontal de consulta e histórico */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'minmax(0, 8fr) minmax(0, 8fr)'
                    },
                    gap: 2,
                    alignItems: 'start'
                }}
            >
                {/* Panel de ingreso manual */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper',
                        minWidth: 0
                    }}
                >
                    {/* Encabezado de consulta */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5
                        }}
                    >
                        <Box
                            sx={{
                                color: 'success.main',
                                display: 'flex',
                                mt: 0.25
                            }}
                        >
                            <CloudDownload />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                            >
                                Ingreso manual del tipo de cambio
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                El sistema propone 1.000 como valor inicial. Actualízalo con el dato oficial antes de guardarlo.
                            </Typography>
                        </Box>
                    </Box>

                    
                    {/* Período pendiente y botón de consulta en la misma fila */}
                    {siguientePeriodo && (
                        <Box
                            sx={{
                                mt: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                flexWrap: 'wrap'
                            }}
                        >
                            {/* Caja del período */}
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    backgroundColor: 'action.hover',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    flex: 1,
                                    minWidth: 0
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Período por consultar:
                                </Typography>

                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                >
                                    {formatearPeriodo(
                                        siguientePeriodo.anho,
                                        siguientePeriodo.mes
                                    )}
                                </Typography>
                            </Box>

                            {/* Botón a la derecha */}
                            <Button
                                variant="contained"
                                onClick={handlePrepararIngresoManual}
                                disabled={
                                    consultando ||
                                    loading ||
                                    !siguientePeriodo
                                }
                                startIcon={
                                    consultando
                                        ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )
                                        : <CurrencyExchange />
                                }
                                sx={{
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    flexShrink: 0
                                }}
                            >
                                {consultando
                                    ? 'Preparando...'
                                    : 'Ingresar siguiente mes'}
                            </Button>
                        </Box>
                    )}

                    {/* Mensaje de error de consulta */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mt: 2,
                                borderRadius: 1
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                </Paper>

                {/* Panel del histórico de tipos de cambio */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper',
                        minWidth: 0
                    }}
                >
                    {/* Encabezado y buscador del histórico */}
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ mb: 0.5 }}
                        >
                            Histórico de tipos de cambio
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            Consulta y administra los valores mensuales compartidos por las empresas.
                        </Typography>

                        <SearchInput
                            value={busqueda}
                            onChange={handleCambioBusqueda}
                            placeholder="Buscar por año, mes, tipo de cambio o estado..."
                            ariaLabel="Buscar en el histórico de tipos de cambio"
                        />
                        <ActiveFilterChips
                            filters={busqueda.trim() ? [{ id: 'busqueda', label: `Búsqueda: ${busqueda}`, onRemove: () => handleCambioBusqueda({ target: { value: '' } }) }] : []}
                            onClear={busqueda.trim() ? () => handleCambioBusqueda({ target: { value: '' } }) : undefined}
                        />
                    </Box>
                    {/* Mantén aquí la tabla del histórico y su paginación */}
                </Paper>
            </Box>
            
            <TipoCambioTable
                rows={tiposCambioPaginados}
                loading={loading}
                busqueda={busqueda}
                total={totalRegistros}
                pagina={pagina}
                registrosPorPagina={registrosPorPagina}
                onEdit={handleEditarTipo}
                onPageChange={handleChangePagina}
                onRowsPerPageChange={handleChangeRegistrosPorPagina}
            />

            <TipoCambioDialogs
                dialogPropuestaOpen={dialogPropuestaOpen}
                setDialogPropuestaOpen={setDialogPropuestaOpen}
                guardando={guardando}
                propuesta={propuesta}
                setPropuesta={setPropuesta}
                handleConfirmarPropuesta={handleConfirmarPropuesta}
                dialogEdicionOpen={dialogEdicionOpen}
                handleCerrarEdicion={handleCerrarEdicion}
                tipoSeleccionado={tipoSeleccionado}
                formulario={formulario}
                handleChangeFormulario={handleChangeFormulario}
                erroresFormulario={erroresFormulario}
                handleGuardarEdicion={handleGuardarEdicion}
                mensaje={mensaje}
                handleCerrarMensaje={handleCerrarMensaje}
                error={error}
                handleCerrarError={handleCerrarError}
            />
        </Box>
        </CompactModuleTheme>
    )
}

export default TipoCambio
