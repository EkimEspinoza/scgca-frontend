import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material'

import {
  Add as AddIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'

import {
  obtenerCentrosCosto,
  obtenerOpcionesFiltros,
} from '../services/centroCostoService'

import { obtenerEmpresas } from '../services/empresaService'

import {
  obtenerTiposCentroCosto,
  obtenerTiposMaquinaria,
  obtenerComparativos,
  obtenerVariedades,
} from '../services/maestroService'

import CentroCostoFilters from '../components/centroCosto/CentroCostoFilters'
import CentroCostoTable from '../components/centroCosto/CentroCostoTable'
import CentroCostoForm from '../components/centroCosto/CentroCostoForm'


function CentroCostos() {
  /*
   * ==============================
   * DATOS
   * ==============================
   */
  const [centros, setCentros] = useState([])

  const [empresas, setEmpresas] = useState([])

  const [
    tiposCentroCosto,
    setTiposCentroCosto,
  ] = useState([])

  const [
    tiposMaquinaria,
    setTiposMaquinaria,
  ] = useState([])

  const [
    comparativos,
    setComparativos,
  ] = useState([])

  const [
    variedades,
    setVariedades,
  ] = useState([])


  /*
   * ==============================
   * OPCIONES DEPENDIENTES
   * ==============================
   */
  const [
    tiposCentroCostoDisponibles,
    setTiposCentroCostoDisponibles,
  ] = useState([])

  const [
    tiposMaquinariaDisponibles,
    setTiposMaquinariaDisponibles,
  ] = useState([])

  const [
    comparativosDisponibles,
    setComparativosDisponibles,
  ] = useState([])

  const [
    variedadesDisponibles,
    setVariedadesDisponibles,
  ] = useState([])


  /*
   * ==============================
   * ESTADOS DE CARGA
   * ==============================
   */
  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    loadingMaestros,
    setLoadingMaestros,
  ] = useState(true)

  const [
    loadingOpciones,
    setLoadingOpciones,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')


  /*
   * ==============================
   * FORMULARIO
   * ==============================
   */
  const [
    modalNuevo,
    setModalNuevo,
  ] = useState(false)


  /*
   * ==============================
   * CENTRO DE COSTO A EDITAR
   * ==============================
   */
  const [
    centroCostoEditar,
    setCentroCostoEditar,
  ] = useState(null)


  /*
   * ==============================
   * RECARGAR TABLA
   * ==============================
   */
  const [
    recarga,
    setRecarga,
  ] = useState(0)


  /*
   * ==============================
   * NOTIFICACIONES
   * ==============================
   */
  const [
    notificacion,
    setNotificacion,
  ] = useState({
    open: false,
    mensaje: '',
    severity: 'success',
  })


  /*
   * ==============================
   * FILTROS
   * ==============================
   */
  const [
    empresaId,
    setEmpresaId,
  ] = useState('')

  const [
    estado,
    setEstado,
  ] = useState('')

  const [
    tipoCcId,
    setTipoCcId,
  ] = useState('')

  const [
    tipoMaqId,
    setTipoMaqId,
  ] = useState('')

  const [
    comparativoId,
    setComparativoId,
  ] = useState('')

  const [
    variedadId,
    setVariedadId,
  ] = useState('')

  const [
    busqueda,
    setBusqueda,
  ] = useState('')


  /*
   * ==============================
   * PAGINACIÓN
   * ==============================
   */
  const [
    pagina,
    setPagina,
  ] = useState(0)

  const [
    registrosPorPagina,
    setRegistrosPorPagina,
  ] = useState(25)

  const [
    total,
    setTotal,
  ] = useState(0)


  /*
   * ==============================
   * REGLAS
   * ==============================
   */
  const TIPO_MAQUINARIAS = 3
  const TIPO_LEVANTE = 4
  const TIPO_INVERSION_CAMPO = 15
  const TIPO_VIVEROS = 16


  /*
   * ==============================
   * VISIBILIDAD DE FILTROS
   * ==============================
   */
  const mostrarTipoMaquinaria =
    Number(tipoCcId) ===
    TIPO_MAQUINARIAS

  const mostrarComparativo =
    Number(tipoCcId) === TIPO_LEVANTE ||
    Number(tipoCcId) ===
      TIPO_INVERSION_CAMPO

  const mostrarVariedad =
    Number(tipoCcId) === TIPO_LEVANTE ||
    Number(tipoCcId) ===
      TIPO_INVERSION_CAMPO ||
    Number(tipoCcId) === TIPO_VIVEROS


  /*
   * ==============================
   * CARGAR MAESTROS
   * ==============================
   */
  useEffect(() => {
    async function cargarMaestros() {
      try {
        setLoadingMaestros(true)
        setError('')

        const [
          empresasData,
          tiposCcData,
          tiposMaqData,
          comparativosData,
          variedadesData,
        ] = await Promise.all([
          obtenerEmpresas(),
          obtenerTiposCentroCosto(),
          obtenerTiposMaquinaria(),
          obtenerComparativos(),
          obtenerVariedades(),
        ])

        setEmpresas(
          empresasData.filter(
            (item) =>
              item.estado === true,
          ),
        )

        setTiposCentroCosto(
          tiposCcData.filter(
            (item) =>
              item.estado === true,
          ),
        )

        setTiposMaquinaria(
          tiposMaqData.filter(
            (item) =>
              item.estado === true,
          ),
        )

        setComparativos(
          comparativosData.filter(
            (item) =>
              item.estado === true,
          ),
        )

        setVariedades(
          variedadesData.filter(
            (item) =>
              item.estado === true,
          ),
        )
      } catch (err) {
        console.error(err)

        setError(
          'No se pudieron cargar los filtros maestros.',
        )
      } finally {
        setLoadingMaestros(false)
      }
    }

    cargarMaestros()
  }, [])


  /*
   * ==============================
   * CARGAR OPCIONES DEPENDIENTES
   * ==============================
   */
  useEffect(() => {
    async function cargarOpciones() {
      try {
        setLoadingOpciones(true)

        const resultado =
          await obtenerOpcionesFiltros({
            empresaId:
              empresaId === ''
                ? null
                : Number(empresaId),

            estado:
              estado === ''
                ? null
                : estado === 'true',

            tipoCcId:
              tipoCcId === ''
                ? null
                : Number(tipoCcId),
          })

        setTiposCentroCostoDisponibles(
          resultado.tiposCentroCosto ??
            [],
        )

        setTiposMaquinariaDisponibles(
          resultado.tiposMaquinaria ??
            [],
        )

        setComparativosDisponibles(
          resultado.comparativos ??
            [],
        )

        setVariedadesDisponibles(
          resultado.variedades ??
            [],
        )
      } catch (err) {
        console.error(err)

        setError(
          'No se pudieron cargar las opciones de los filtros.',
        )
      } finally {
        setLoadingOpciones(false)
      }
    }

    if (!loadingMaestros) {
      cargarOpciones()
    }
  }, [
    empresaId,
    estado,
    tipoCcId,
    loadingMaestros,
  ])


  /*
   * ==============================
   * TIPOS CC FILTRADOS
   * ==============================
   */
  const tiposCentroCostoFiltrados =
    tiposCentroCosto.filter((tipo) =>
      tiposCentroCostoDisponibles.includes(
        Number(tipo.id_tip_cc),
      ),
    )


  /*
   * ==============================
   * VALIDAR FILTROS DEPENDIENTES
   * ==============================
   */
  useEffect(() => {
    if (
      tipoCcId !== '' &&
      !tiposCentroCostoFiltrados.some(
        (tipo) =>
          Number(tipo.id_tip_cc) ===
          Number(tipoCcId),
      )
    ) {
      setTipoCcId('')
      setTipoMaqId('')
      setComparativoId('')
      setVariedadId('')
    }

    if (
      tipoMaqId !== '' &&
      !tiposMaquinariaDisponibles.includes(
        Number(tipoMaqId),
      )
    ) {
      setTipoMaqId('')
    }

    if (
      comparativoId !== '' &&
      !comparativosDisponibles.includes(
        Number(comparativoId),
      )
    ) {
      setComparativoId('')
    }

    if (
      variedadId !== '' &&
      !variedadesDisponibles.includes(
        Number(variedadId),
      )
    ) {
      setVariedadId('')
    }
  }, [
    tiposCentroCostoFiltrados,
    tiposMaquinariaDisponibles,
    comparativosDisponibles,
    variedadesDisponibles,
    tipoCcId,
    tipoMaqId,
    comparativoId,
    variedadId,
  ])


  /*
   * ==============================
   * CARGAR CENTROS DE COSTO
   * ==============================
   */
  useEffect(() => {
    async function cargarCentros() {
      try {
        setLoading(true)
        setError('')

        const resultado =
          await obtenerCentrosCosto({
            empresaId:
              empresaId === ''
                ? null
                : Number(empresaId),

            estado:
              estado === ''
                ? null
                : estado === 'true',

            tipoCcId:
              tipoCcId === ''
                ? null
                : Number(tipoCcId),

            tipoMaqId:
              mostrarTipoMaquinaria &&
              tipoMaqId !== ''
                ? Number(tipoMaqId)
                : null,

            comparativoId:
              mostrarComparativo &&
              comparativoId !== ''
                ? Number(comparativoId)
                : null,

            variedadId:
              mostrarVariedad &&
              variedadId !== ''
                ? Number(variedadId)
                : null,

            busqueda,

            pagina: pagina + 1,
            registrosPorPagina,
          })

        setCentros(
          resultado.data ?? [],
        )

        setTotal(
          resultado.count ?? 0,
        )
      } catch (err) {
        console.error(err)

        setError(
          'No se pudieron cargar los centros de costo.',
        )
      } finally {
        setLoading(false)
      }
    }

    if (!loadingMaestros) {
      cargarCentros()
    }
  }, [
    empresaId,
    estado,
    tipoCcId,
    tipoMaqId,
    comparativoId,
    variedadId,
    busqueda,
    pagina,
    registrosPorPagina,
    loadingMaestros,
    mostrarTipoMaquinaria,
    mostrarComparativo,
    mostrarVariedad,
    recarga,
  ])


  /*
   * ==============================
   * MANEJO DE FILTROS
   * ==============================
   */
  const handleEmpresaChange = (
    event,
  ) => {
    setEmpresaId(
      event.target.value,
    )

    setTipoCcId('')
    setTipoMaqId('')
    setComparativoId('')
    setVariedadId('')

    setPagina(0)
  }


  const handleEstadoChange = (
    event,
  ) => {
    setEstado(
      event.target.value,
    )

    setTipoCcId('')
    setTipoMaqId('')
    setComparativoId('')
    setVariedadId('')

    setPagina(0)
  }


  const handleTipoCcChange = (
    event,
  ) => {
    const nuevoTipoCc =
      event.target.value

    setTipoCcId(nuevoTipoCc)

    setTipoMaqId('')
    setComparativoId('')
    setVariedadId('')

    setPagina(0)
  }


  const handleTipoMaqChange = (
    event,
  ) => {
    setTipoMaqId(
      event.target.value,
    )

    setPagina(0)
  }


  const handleComparativoChange = (
    event,
  ) => {
    setComparativoId(
      event.target.value,
    )

    setPagina(0)
  }


  const handleVariedadChange = (
    event,
  ) => {
    setVariedadId(
      event.target.value,
    )

    setPagina(0)
  }


  const handleBusquedaChange = (
    event,
  ) => {
    setBusqueda(
      event.target.value,
    )

    setPagina(0)
  }


  /*
   * ==============================
   * LIMPIAR FILTROS
   * ==============================
   */
  const limpiarFiltros = () => {
    setEmpresaId('')
    setEstado('')
    setTipoCcId('')
    setTipoMaqId('')
    setComparativoId('')
    setVariedadId('')
    setBusqueda('')
    setPagina(0)
  }


  /*
   * ==============================
   * PAGINACIÓN
   * ==============================
   */
  const handleChangePagina = (
    _,
    nuevaPagina,
  ) => {
    setPagina(nuevaPagina)
  }


  const handleChangeRegistrosPorPagina =
    (event) => {
      setRegistrosPorPagina(
        parseInt(
          event.target.value,
          10,
        ),
      )

      setPagina(0)
    }


  /*
   * ==============================
   * NUEVO CENTRO DE COSTO
   * ==============================
   */
  const abrirNuevoCentroCosto = () => {
    setCentroCostoEditar(null)
    setModalNuevo(true)
  }


  /*
   * ==============================
   * EDITAR CENTRO DE COSTO
   * ==============================
   */
  const abrirEditarCentroCosto = (
    centro,
  ) => {
    setCentroCostoEditar(centro)
    setModalNuevo(true)
  }


  /*
   * ==============================
   * CERRAR FORMULARIO
   * ==============================
   */
  const cerrarNuevoCentroCosto = () => {
    setModalNuevo(false)
    setCentroCostoEditar(null)
  }


  /*
   * ==============================
   * CENTRO DE COSTO GUARDADO
   * ==============================
   */
  const handleCentroCostoGuardado = (
    registro,
    modoEdicion = false,
  ) => {
    setRecarga(
      (valor) => valor + 1,
    )

    setNotificacion({
      open: true,
      mensaje: modoEdicion
        ? `Centro de Costo ${registro.cod_cc} actualizado correctamente.`
        : `Centro de Costo ${registro.cod_cc} registrado correctamente.`,
      severity: 'success',
    })
  }


  /*
   * ==============================
   * CERRAR NOTIFICACIÓN
   * ==============================
   */
  const cerrarNotificacion = (
    _event,
    reason,
  ) => {
    if (reason === 'clickaway') {
      return
    }

    setNotificacion((prev) => ({
      ...prev,
      open: false,
    }))
  }


  /*
   * ==============================
   * RENDER
   * ==============================
   */
  return (
    <Box>

      {/* =====================================================
          ENCABEZADO DEL MÓDULO
      ====================================================== */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          alignItems: {
            xs: 'stretch',
            sm: 'center',
          },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >

        {/* ===================================================
            TÍTULO
        ==================================================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              backgroundColor: 'primary.light',
              color: 'primary.dark',
              opacity: 0.95,
            }}
          >
            <StorageIcon
              sx={{
                fontSize: 32,
              }}
            />
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: '1.5rem',
                  sm: '1.75rem',
                },
                lineHeight: 1.2,
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              Centros de Costo
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Consulta y gestión de los centros de costo registrados en el sistema.
            </Typography>
          </Box>
        </Box>


        {/* ===================================================
            BOTÓN NUEVO
        ==================================================== */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={
            abrirNuevoCentroCosto
          }
          sx={{
            minWidth: {
              xs: '100%',
              sm: 220,
            },
            height: 44,
            flexShrink: 0,
            fontWeight: 700,
            borderRadius: 1.5,
            boxShadow: 'none',

            '&:hover': {
              boxShadow: 'none',
            },
          }}
        >
          Nuevo Centro de Costo
        </Button>
      </Box>


      {/* =====================================================
          FILTROS
      ====================================================== */}
      <CentroCostoFilters
        empresas={empresas}
        tiposCentroCosto={
          tiposCentroCostoFiltrados
        }
        tiposMaquinaria={
          tiposMaquinaria
        }
        comparativos={
          comparativos
        }
        variedades={
          variedades
        }
        tiposMaquinariaDisponibles={
          tiposMaquinariaDisponibles
        }
        comparativosDisponibles={
          comparativosDisponibles
        }
        variedadesDisponibles={
          variedadesDisponibles
        }
        loadingMaestros={
          loadingMaestros
        }
        loadingOpciones={
          loadingOpciones
        }
        empresaId={
          empresaId
        }
        estado={
          estado
        }
        tipoCcId={
          tipoCcId
        }
        tipoMaqId={
          tipoMaqId
        }
        comparativoId={
          comparativoId
        }
        variedadId={
          variedadId
        }
        busqueda={
          busqueda
        }
        mostrarTipoMaquinaria={
          mostrarTipoMaquinaria
        }
        mostrarComparativo={
          mostrarComparativo
        }
        mostrarVariedad={
          mostrarVariedad
        }
        onEmpresaChange={
          handleEmpresaChange
        }
        onEstadoChange={
          handleEstadoChange
        }
        onTipoCcChange={
          handleTipoCcChange
        }
        onTipoMaqChange={
          handleTipoMaqChange
        }
        onComparativoChange={
          handleComparativoChange
        }
        onVariedadChange={
          handleVariedadChange
        }
        onBusquedaChange={
          handleBusquedaChange
        }
        onLimpiarFiltros={
          limpiarFiltros
        }
      />


      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Alert severity="error">
            {error}
          </Alert>
        </Paper>
      )}


      {/* =====================================================
          TABLA
      ====================================================== */}
      <CentroCostoTable
        centros={centros}
        loading={loading}
        total={total}
        pagina={pagina}
        registrosPorPagina={
          registrosPorPagina
        }
        onChangePagina={
          handleChangePagina
        }
        onChangeRegistrosPorPagina={
          handleChangeRegistrosPorPagina
        }
        onEditar={
          abrirEditarCentroCosto
        }
      />


      {/* =====================================================
          FORMULARIO NUEVO / EDITAR
      ====================================================== */}
      <CentroCostoForm
        open={modalNuevo}
        onClose={
          cerrarNuevoCentroCosto
        }
        onSaved={
          handleCentroCostoGuardado
        }
        centroCostoEditar={
          centroCostoEditar
        }
        empresas={
          empresas
        }
        tiposCentroCosto={
          tiposCentroCosto
        }
        tiposMaquinaria={
          tiposMaquinaria
        }
        comparativos={
          comparativos
        }
        variedades={
          variedades
        }
        loadingMaestros={
          loadingMaestros
        }
      />


      {/* =====================================================
          NOTIFICACIÓN
      ====================================================== */}
      <Snackbar
        open={
          notificacion.open
        }
        autoHideDuration={4000}
        onClose={
          cerrarNotificacion
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={
            cerrarNotificacion
          }
          severity={
            notificacion.severity
          }
          variant="filled"
          sx={{
            width: '100%',
          }}
        >
          {
            notificacion.mensaje
          }
        </Alert>
      </Snackbar>

    </Box>
  )
}


export default CentroCostos