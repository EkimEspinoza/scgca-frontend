import { Alert, Box, Button, Paper, Snackbar, Typography, } from '@mui/material'
import { Add as AddIcon, Storage as StorageIcon, TableView as TableViewIcon } from '@mui/icons-material'

import { useCentroCosto } from '../hooks/useCentroCosto'

import CentroCostoFilters from '../components/centroCosto/CentroCostoFilters'
import CentroCostoTable from '../components/centroCosto/CentroCostoTable'
import CentroCostoForm from '../components/centroCosto/CentroCostoForm'


function CentroCostos() {

  const {
    //=====================================================
    //DATOS
    //=====================================================

    centros,
    empresas,
    tiposCentroCosto,
    tiposCentroCostoFiltrados,
    tiposMaquinaria,
    comparativos,
    variedades,

    //=====================================================
    // OPCIONES DEPENDIENTES
    // =====================================================

    tiposMaquinariaDisponibles,
    comparativosDisponibles,
    variedadesDisponibles,


    // =====================================================
    // ESTADOS
    // =====================================================

    loading,
    loadingMaestros,
    loadingOpciones,
    exportandoExcel,
    error,


    // =====================================================
    // FORMULARIO
    // =====================================================

    modalNuevo,
    centroCostoEditar,

    // =====================================================
    // NOTIFICACIÓN
    // =====================================================

    notificacion,

     // =====================================================
     // FILTROS
     // =====================================================
     
    empresaId,
    estado,
    tipoCcId,
    tipoMaqId,
    comparativoId,
    variedadId,
    busqueda,

     // =====================================================
     // VISIBILIDAD
     // =====================================================
     
    mostrarTipoMaquinaria,
    mostrarComparativo,
    mostrarVariedad,

     // =====================================================
     // PAGINACIÓN
     // =====================================================

    pagina,
    registrosPorPagina,
    total,

     // =====================================================
     // EVENTOS
     // =====================================================
     
    handleEmpresaChange,
    handleEstadoChange,
    handleTipoCcChange,
    handleTipoMaqChange,
    handleComparativoChange,
    handleVariedadChange,
    handleBusquedaChange,

    limpiarFiltros,

    handleChangePagina,
    handleChangeRegistrosPorPagina,

    handleExportarExcel,

    abrirNuevoCentroCosto,
    abrirEditarCentroCosto,
    cerrarNuevoCentroCosto,

    handleCentroCostoGuardado,
    cerrarNotificacion,

  } = useCentroCosto()


  return (
    

    <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <Box
        sx={{
          display: 'flex',flexDirection: {xs: 'column',sm: 'row'},
          alignItems: {xs: 'stretch',sm: 'center'},justifyContent:'space-between',
          gap: 2,flexShrink: 0,mb: 1,minWidth: 0,
        }}
      >

        {/* =================================================
            TÍTULO
        ================================================== */}

        <Box sx={{display: 'flex',alignItems: 'center',gap: 1.75,minWidth: 0}}>
          <Box sx={{width: 56,height: 56,flexShrink: 0,display: 'flex',alignItems: 'center',justifyContent: 'center',borderRadius: 1,backgroundColor:'primary.light',color:'primary.dark',opacity: 0.95}}>
            <StorageIcon sx={{fontSize: 32}}/>
          </Box>

          <Box sx={{minWidth: 0}}>
            <Typography component="h1" sx={{fontSize: {xs: '1.5rem',sm: '1.75rem'},lineHeight: 1.2,fontWeight: 700,color:'text.primary'}}>
              Centros de Costo
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
              Consulta y gestión de los centros de costo registrados en el sistema.
            </Typography>
          </Box>
        </Box>

        {/* =================================================
            ACCIONES
        ================================================== */}

        <Box sx={{display: 'flex',flexDirection: {xs: 'column',sm: 'row',},gap: 1,width: {xs: '100%',sm: 'auto'},flexShrink: 0}}>

          {/* =============================================
              EXPORTAR EXCEL
          ============================================== */}

          <Button
            variant="outlined"
            startIcon={<TableViewIcon />}
            onClick={handleExportarExcel}
            disabled={ exportandoExcel ||loadingMaestros ||loadingOpciones}
            sx={{minWidth: {xs: '100%',sm: 170},height: 44,fontWeight: 700,borderRadius: 1,boxShadow: 'none','&:hover': {boxShadow: 'none'}}}
          >
            {exportandoExcel ? 'Exportando...' : 'Exportar Excel'}
          </Button>

          {/* =============================================
              NUEVO CENTRO DE COSTO
          ============================================== */}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirNuevoCentroCosto}
            sx={{minWidth: {xs: '100%',sm: 220},height: 44,flexShrink: 0,fontWeight: 700,borderRadius: 1,boxShadow: 'none','&:hover': {boxShadow: 'none'}}}>
            Nuevo Centro de Costo
          </Button>

        </Box>

      </Box>


      {/* =====================================================
          FILTROS
      ====================================================== */}

      <Box sx={{flexShrink: 0,minWidth: 0 ,mb: 1}}>

        <CentroCostoFilters
          empresas={empresas}
          tiposCentroCosto={tiposCentroCostoFiltrados}
          tiposMaquinaria={tiposMaquinaria}
          comparativos={comparativos}
          variedades={variedades}
          tiposMaquinariaDisponibles={tiposMaquinariaDisponibles}
          comparativosDisponibles={comparativosDisponibles}
          variedadesDisponibles={variedadesDisponibles}
          loadingMaestros={loadingMaestros}
          loadingOpciones={loadingOpciones}
          empresaId={empresaId}
          estado={estado}
          tipoCcId={tipoCcId}
          tipoMaqId={tipoMaqId}
          comparativoId={comparativoId}
          variedadId={variedadId}
          busqueda={busqueda}
          mostrarTipoMaquinaria={mostrarTipoMaquinaria}
          mostrarComparativo={mostrarComparativo}
          mostrarVariedad={mostrarVariedad}
          
          onEmpresaChange={handleEmpresaChange}
          onEstadoChange={handleEstadoChange}
          onTipoCcChange={handleTipoCcChange}
          onTipoMaqChange={handleTipoMaqChange}
          onComparativoChange={handleComparativoChange}
          onVariedadChange={handleVariedadChange}
          onBusquedaChange={handleBusquedaChange}
          onLimpiarFiltros={limpiarFiltros}
        />

      </Box>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <Paper elevation={0} sx={{p: 2,mb: 2,flexShrink: 0,borderRadius: 1,border: '1px solid', borderColor:'divider'}}>
          <Alert severity="error">
            {error}
          </Alert>
        </Paper>
      )}


      {/* =====================================================
          TABLA
      ====================================================== */}

      <Box sx={{flex: '1 1 0%',minHeight: 0,minWidth: 0,width: '100%',maxWidth: '100%',display: 'flex',overflow: 'hidden'}}>

        <CentroCostoTable
          centros={centros}
          loading={loading}
          total={total}
          pagina={pagina}
          registrosPorPagina={registrosPorPagina}
          onChangePagina={handleChangePagina}
          onChangeRegistrosPorPagina={handleChangeRegistrosPorPagina}
          onEditar={abrirEditarCentroCosto}
        />

      </Box>


      {/* =====================================================
          FORMULARIO
      ====================================================== */}

      <CentroCostoForm
        open={modalNuevo}

        onClose={cerrarNuevoCentroCosto}
        onSaved={handleCentroCostoGuardado}
        
        centroCostoEditar={centroCostoEditar}
        empresas={empresas}
        tiposCentroCosto={tiposCentroCosto}
        tiposMaquinaria={tiposMaquinaria}
        comparativos={comparativos}
        variedades={variedades}
        loadingMaestros={loadingMaestros}
      />


      {/* =====================================================
          NOTIFICACIÓN
      ====================================================== */}

      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={cerrarNotificacion}
        anchorOrigin={{vertical: 'bottom',horizontal: 'right'}}>

        <Alert
          onClose={cerrarNotificacion}
          severity={notificacion.severity}
          variant="filled"
          sx={{width: '100%'}}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CentroCostos