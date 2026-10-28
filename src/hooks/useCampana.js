import { useCallback, useEffect, useMemo, useState } from 'react'
import { obtenerCampanas, obtenerEmpresasActivas, obtenerCentrosCostoParaCampana, crearCampana, actualizarCampana, cambiarEstadoCampana, eliminarCampana } from '../services/campanaService'
import { validarFormularioCampana, construirDatosCampana, obtenerMensajeErrorCampana } from '../components/campanas/campanaRules'

export const formularioInicial = {
    id_campana_emp: '',
    id_empresa: '',
    cod_cc_pk: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_inicio_ctb: '',
    fecha_fin_ctb: '',
    hectareas: '',
    estado: true,
    cierre_camp: false,
}

function sumarUnDia(fecha) {
    if (!fecha) return ''
    const [anio, mes, dia] = fecha.split('-').map(Number)
    if (!anio || !mes || !dia) return ''
    return new Date(Date.UTC(anio, mes - 1, dia + 1)).toISOString().slice(0, 10)
}

function useCampana({ codCcPkContextual = '' } = {}) {
    // ============================================================
    // DATOS
    // ============================================================

    const [campanas, setCampanas] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [centrosCosto, setCentrosCosto] = useState([])


    /* ============================================================
     * CARGAS
     * ============================================================
     */

    const [loading, setLoading] = useState(true)
    const [loadingEmpresas, setLoadingEmpresas] = useState(true)
    const [loadingCentrosCosto, setLoadingCentrosCosto] = useState(false)


    // ============================================================
    // FILTROS
    // ============================================================


    const [busqueda, setBusqueda] = useState('')
    const [empresaFiltro, setEmpresaFiltro] = useState('')
    const [tipoCentroCostoFiltro, setTipoCentroCostoFiltro] = useState('')
    const [centroCostoFiltro, setCentroCostoFiltro] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState('')
    const [cierreFiltro, setCierreFiltro] = useState('')

    // ============================================================
    // PAGINACIÓN
    // ============================================================

    const [pagina, setPagina] = useState(0)
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10)

    // ============================================================
    // FORMULARIO
    // ============================================================

    const [modalAbierto, setModalAbierto] = useState(false)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [campanaSeleccionada, setCampanaSeleccionada] = useState(null)
    const [formulario, setFormulario] = useState(formularioInicial)

    // ============================================================
    // ESTADOS DE OPERACIÓN
    // ============================================================

    const [guardando, setGuardando] = useState(false)
    const [eliminando, setEliminando] = useState(false)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [campanaCambioEstado, setCampanaCambioEstado] = useState(null)
    const [cambiandoEstado, setCambiandoEstado] = useState(false)
    const [exportandoExcel, setExportandoExcel] = useState(false)

    // ============================================================
    // NOTIFICACIÓN
    // ============================================================

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    // ============================================================
    // CONTEXTO
    // ============================================================

    const esModoContextual = Boolean(codCcPkContextual)

    const ultimaCampanaCentroCosto = useMemo(() => {
        if (!formulario.cod_cc_pk || modoEdicion) return null

        return campanas
            .filter((campana) => String(campana.cod_cc_pk) === String(formulario.cod_cc_pk))
            .sort((a, b) =>
                (b.fecha_fin ?? '').localeCompare(a.fecha_fin ?? '') ||
                (b.fecha_fin_ctb ?? '').localeCompare(a.fecha_fin_ctb ?? ''),
            )[0] ?? null
    }, [campanas, formulario.cod_cc_pk, modoEdicion])

    const mostrarMensaje = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity })
    }, [])

    const cargarDatos = useCallback(async () => {
        setLoading(true)
        try {
            const [campanasData, empresasData] = await Promise.all([obtenerCampanas(), obtenerEmpresasActivas()])
            setCampanas(campanasData ?? [])
            setEmpresas(empresasData ?? [])
        }
        catch (error) {
            mostrarMensaje(obtenerMensajeErrorCampana(error), 'error')
        }
        finally {
            setLoading(false)
            setLoadingEmpresas(false)
        }
    }, [mostrarMensaje])

    const cargarCentrosCosto = useCallback(async (idEmpresa) => {
        setLoadingCentrosCosto(true)
        try {
            const data = await obtenerCentrosCostoParaCampana(idEmpresa)
            setCentrosCosto(data ?? [])
        }
        catch (error) {
            setCentrosCosto([])
            mostrarMensaje(obtenerMensajeErrorCampana(error), 'error')
        } finally { setLoadingCentrosCosto(false) }
    }, [mostrarMensaje])

    // ============================================================
    // CARGA INICIAL
    // ============================================================

    useEffect(() => {
        // Load remote data on mount; the state updates are part of the async request lifecycle.
        // eslint-disable-next-line react/set-state-in-effect
        void cargarDatos()
    }, [cargarDatos])

    // ============================================================
    // CARGAR CENTROS DE COSTO
    // ============================================================

    useEffect(() => {
        // eslint-disable-next-line react/set-state-in-effect
        if (!formulario.id_empresa) {
            // eslint-disable-next-line react/set-state-in-effect
            setCentrosCosto([])
            return
        }
        // eslint-disable-next-line react/set-state-in-effect
        void cargarCentrosCosto(formulario.id_empresa)
    }, [formulario.id_empresa, cargarCentrosCosto])

    function handleBusquedaChange(event) {
        setBusqueda(event.target.value)
        setPagina(0)
    }
    // ============================================================
    // FILTRO POR EMPRESA
    // ============================================================

    async function handleEmpresaFiltroChange(event) {
        const idEmpresa = event.target.value
        setEmpresaFiltro(idEmpresa)
        setTipoCentroCostoFiltro('')
        // Al cambiar la empresa,
        // el Centro de Costo seleccionado
        // deja de ser válido.
        setCentroCostoFiltro('')
        setPagina(0)
        if (!idEmpresa) {
            setCentrosCosto([])
            return
        }
        await cargarCentrosCosto(idEmpresa)
    }

    // ============================================================
    // FILTRO POR TIPO DE CENTRO DE COSTO
    // ============================================================

    function handleTipoCentroCostoFiltroChange(event) {
        setTipoCentroCostoFiltro(event.target.value)
        setCentroCostoFiltro('')
        setPagina(0)
    }

    // ============================================================
    // FILTRO POR CENTRO DE COSTO
    // ============================================================

    function handleCentroCostoFiltroChange(event) {
        setCentroCostoFiltro(event.target.value)
        setPagina(0)
    }

    // ============================================================
    // FILTRO POR ESTADO
    // ''     = Todos
    // 'true' = Activo
    // 'false'= Inactivo
    // ============================================================

    function handleEstadoFiltroChange(event) {
        setEstadoFiltro(event.target.value)
        setPagina(0)
    }

    // ============================================================
    // FILTRO POR CIERRE
    // ''     = Todos
    // 'false'= Abierta
    // 'true' = Cerrada
    // ============================================================

    function handleCierreFiltroChange(event) {
        setCierreFiltro(event.target.value)
        setPagina(0)
    }

    // ============================================================
    // FILTROS / BÚSQUEDA
    // ============================================================

    const campanasFiltradas =
        useMemo(() => {
            const texto = busqueda.trim().toLowerCase()
            let resultado = campanas

            // ====================================================
            // MODO CONTEXTUAL
            // ====================================================

            if (esModoContextual) { resultado = resultado.filter((campana) => String(campana.cod_cc_pk) === String(codCcPkContextual)) }

            // ====================================================
            // FILTRO POR EMPRESA
            // ====================================================

            if (empresaFiltro) {
                resultado = resultado.filter((campana) => String(campana.id_empresa) === String(empresaFiltro))
            }

            // ====================================================
            // FILTRO POR TIPO DE CENTRO DE COSTO
            // ====================================================

            if (tipoCentroCostoFiltro) {
                resultado = resultado.filter((campana) => String(campana.centro_costo?.id_tip_cc) === String(tipoCentroCostoFiltro))
            }

            // ====================================================
            // FILTRO POR CENTRO DE COSTO
            // ====================================================

            if (centroCostoFiltro) {
                resultado = resultado.filter((campana) => String(campana.cod_cc_pk) === String(centroCostoFiltro))
            }

            // ====================================================
            // FILTRO POR ESTADO
            // ====================================================


            if (estadoFiltro !== '') {
                const estadoSeleccionado = estadoFiltro === 'true'
                resultado = resultado.filter((campana) => Boolean(campana.estado) === estadoSeleccionado)
            }

            // ====================================================
            // FILTRO POR CIERRE
            // ====================================================

            if (cierreFiltro !== '') {
                const cierreSeleccionado = cierreFiltro === 'true'
                resultado = resultado.filter((campana) => Boolean(campana.cierre_camp) === cierreSeleccionado)
            }

            // ====================================================
            // BÚSQUEDA GENERAL
            // ====================================================

            if (!texto) { return resultado }
            return resultado.filter(
                (campana) => {
                    const empresa = campana.empresa?.descripcion ?? ''
                    const comercial = campana.empresa?.nombre_comercial ?? ''
                    const centroCosto = campana.centro_costo?.desc_cc ?? ''
                    const codigoCc = campana.centro_costo?.cod_cc?.toString() ?? ''
                    const idCampana = campana.id_campana?.toString() ?? ''
                    const idCampanaEmpresa = campana.id_campana_emp?.toString() ?? ''
                    const nombre = campana.nombre_campana ?? ''
                    const estado = campana.estado ? 'activo' : 'inactivo'
                    const cierre = campana.cierre_camp ? 'cerrada' : 'abierta'

                    return [
                        empresa,
                        comercial,
                        centroCosto,
                        codigoCc,
                        idCampana,
                        idCampanaEmpresa,
                        nombre,
                        estado,
                        cierre,
                    ]
                        .join(' ')
                        .toLowerCase()
                        .includes(texto)
                })
        }, [
            campanas,
            busqueda,
            empresaFiltro,
            tipoCentroCostoFiltro,
            centroCostoFiltro,
            estadoFiltro,
            cierreFiltro,
            esModoContextual,
            codCcPkContextual])


    // ============================================================
    // REINICIAR PÁGINA
    // ============================================================

    useEffect(() => {
        // Keep pagination valid when filters change.
        // eslint-disable-next-line react/set-state-in-effect
        setPagina(0)
    }, [
        busqueda,
        empresaFiltro,
        tipoCentroCostoFiltro,
        centroCostoFiltro,
        estadoFiltro,
        cierreFiltro,
        codCcPkContextual,
    ])

    // ============================================================
    // PAGINACIÓN
    // ============================================================

    const campanasPaginadas =
        useMemo(() => {
            const inicio = pagina * registrosPorPagina
            const fin = inicio + registrosPorPagina
            return campanasFiltradas.slice(inicio, fin)
        }, [
            campanasFiltradas,
            pagina,
            registrosPorPagina,
        ])
    // ============================================================
    // LIMPIAR FILTROS
    // ============================================================

    function limpiarFiltros() {
        setEmpresaFiltro('')
        setTipoCentroCostoFiltro('')
        setCentroCostoFiltro('')
        setEstadoFiltro('')
        setCierreFiltro('')
        setBusqueda('')
        setPagina(0)
        if (!esModoContextual) {
            setCentrosCosto([])
        }
    }


    // ============================================================
    // EXPORTAR A EXCEL
    // ============================================================

    async function handleExportarExcel() {
        try {
            setExportandoExcel(true)
            if (!campanasFiltradas.length) {
                mostrarMensaje('No existen campañas para exportar con los filtros actuales.', 'warning')
                return
            }
            const { exportarCampanasExcel } = await import('../services/excelService')
            const fecha = new Date().toISOString().slice(0, 10)
            exportarCampanasExcel(
                campanasFiltradas,
                `Campanas_${fecha}`,
            )
            mostrarMensaje(`Se exportaron ${campanasFiltradas.length} campañas correctamente.`, 'success')
        } catch (error) {
            console.error('Error exportando Campañas:', error)
            mostrarMensaje('No se pudo generar el archivo Excel.', 'error')
        } finally { setExportandoExcel(false) }
    }

    // ============================================================
    // NUEVA CAMPAÑA
    // ============================================================


    function abrirNuevo() {
        setModoEdicion(false)
        setCampanaSeleccionada(null)
        setErrorFormulario('')
        if (esModoContextual) {
            const ultimaCampana = campanas
                .filter((campana) => String(campana.cod_cc_pk) === String(codCcPkContextual))
                .sort((a, b) =>
                    (b.fecha_fin ?? '').localeCompare(a.fecha_fin ?? '') ||
                    (b.fecha_fin_ctb ?? '').localeCompare(a.fecha_fin_ctb ?? ''),
                )[0]

            setFormulario({
                ...formularioInicial,
                cod_cc_pk: String(codCcPkContextual),
                fecha_inicio: sumarUnDia(ultimaCampana?.fecha_fin),
                fecha_inicio_ctb: sumarUnDia(ultimaCampana?.fecha_fin_ctb),
            })
        } else { setFormulario(formularioInicial) }
        setCentrosCosto([])
        setModalAbierto(true)
    }

    // ============================================================
    // EDITAR CAMPAÑA
    // ============================================================


    function abrirEditar(campana) {
        setModoEdicion(true)
        setCampanaSeleccionada(campana)
        setFormulario({
            id_campana_emp: campana.id_campana_emp?.toString() ?? '',
            nombre_campana: campana.nombre_campana ?? '',
            id_empresa: campana.id_empresa?.toString() ?? '',
            cod_cc_pk: campana.cod_cc_pk?.toString() ?? '',
            fecha_inicio: campana.fecha_inicio ?? '',
            fecha_fin: campana.fecha_fin ?? '',
            fecha_inicio_ctb: campana.fecha_inicio_ctb ?? '',
            fecha_fin_ctb: campana.fecha_fin_ctb ?? '',
            hectareas: campana.hectareas?.toString() ?? '',
            estado: Boolean(campana.estado),
            cierre_camp: Boolean(campana.cierre_camp),
        })
        setErrorFormulario('')
        setModalAbierto(true)
    }


    // ============================================================
    // CERRAR MODAL
    // ============================================================

    function cerrarModal() {
        if (guardando) { return }
        setModalAbierto(false)
        setErrorFormulario('')
        setCampanaSeleccionada(null)
        setFormulario(formularioInicial)
        setCentrosCosto([])
    }


    //============================================================
    // CAMBIO DE CAMPOS
    // ============================================================

    function handleChange(event) {
        const { name, value } = event.target

        if (name === 'cod_cc_pk' && !modoEdicion) {
            const ultimaCampana = campanas
                .filter((campana) => String(campana.cod_cc_pk) === String(value))
                .sort((a, b) =>
                    (b.fecha_fin ?? '').localeCompare(a.fecha_fin ?? '') ||
                    (b.fecha_fin_ctb ?? '').localeCompare(a.fecha_fin_ctb ?? ''),
                )[0]

            setFormulario((prev) => ({
                ...prev,
                [name]: value,
                fecha_inicio: sumarUnDia(ultimaCampana?.fecha_fin),
                fecha_inicio_ctb: sumarUnDia(ultimaCampana?.fecha_fin_ctb),
            }))
            return
        }

        setFormulario((prev) => ({ ...prev, [name]: value }))
    }

    // ============================================================
    // CAMBIO DE BOOLEANOS
    // ============================================================

    function handleBooleanChange(campo, valor) {
        setFormulario((prev) => ({ ...prev, [campo]: valor }))
    }

    function solicitarCambioEstado(campana) {
        setCampanaCambioEstado({
            ...campana,
            nuevoEstado: !Boolean(campana.estado),
        })
    }

    function cerrarConfirmacionCambioEstado() {
        if (cambiandoEstado) return
        setCampanaCambioEstado(null)
    }

    async function confirmarCambioEstado() {
        if (!campanaCambioEstado) return

        const { id_campana, nuevoEstado } = campanaCambioEstado
        setCambiandoEstado(true)

        try {
            const campanaActualizada = await cambiarEstadoCampana(id_campana, nuevoEstado)
            setCampanas((actuales) => actuales.map((campana) =>
                campana.id_campana === id_campana
                    ? { ...campana, ...campanaActualizada }
                    : campana,
            ))
            setPagina(0)
            mostrarMensaje(
                nuevoEstado
                    ? 'Campaña reactivada correctamente.'
                    : 'Campaña desactivada correctamente. El registro se conservó.',
                'success',
            )
            setCampanaCambioEstado(null)
        } catch (error) {
            mostrarMensaje(obtenerMensajeErrorCampana(error), 'error')
        } finally {
            setCambiandoEstado(false)
        }
    }
    // ============================================================
    // GUARDAR
    // ============================================================


    async function handleGuardar() {
        const error = validarFormularioCampana(formulario)
        if (error) {
            setErrorFormulario(error)
            return
        }

        setErrorFormulario('')
        setGuardando(true)

        const formularioParaGuardar =
            modoEdicion ? {
                ...formulario,
                id_campana_emp: campanaSeleccionada?.id_campana_emp?.toString() ?? formulario.id_campana_emp,
            }
                : formulario

        const datos = construirDatosCampana(formularioParaGuardar)
        try {
            if (modoEdicion) {
                await actualizarCampana(campanaSeleccionada.id_campana, datos)
                mostrarMensaje('Campaña actualizada correctamente.', 'success')
            } else {
                await crearCampana(datos)
                mostrarMensaje('Campaña creada correctamente.', 'success')
            }
            await recargarCampanas()
            cerrarModal()
        } catch (error) {
            setErrorFormulario(obtenerMensajeErrorCampana(error))
        }
        finally { setGuardando(false) }
    }

    // ============================================================
    // RECARGAR
    // ============================================================

    async function recargarCampanas() {
        const data = await obtenerCampanas()
        setCampanas(data ?? [])
    }

    // ============================================================
    // ELIMINAR
    // ============================================================

    async function handleEliminar(campana) {

        const confirmar = window.confirm(`¿Está seguro de eliminar la campaña "${campana.nombre_campana}"?`)

        if (!confirmar) { return }
        setEliminando(true)
        try {
            await eliminarCampana(campana.id_campana)
            mostrarMensaje('Campaña eliminada correctamente.', 'success')
            await recargarCampanas()
            const nuevoTotal = campanasFiltradas.length - 1
            const ultimaPagina = Math.max(0, Math.ceil(nuevoTotal / registrosPorPagina) - 1)

            if (pagina > ultimaPagina) { setPagina(ultimaPagina) }
        } catch (error) {
            mostrarMensaje(obtenerMensajeErrorCampana(error), 'error')

        } finally { setEliminando(false) }
    }


    // ============================================================
    // MENSAJES
    // ============================================================

    function cerrarSnackbar() {
        setSnackbar(
            (prev) => ({ ...prev, open: false }))
    }

    // ============================================================
    // RETORNO
    // ============================================================


    return {

        /* Datos */

        campanas,

        setCampanas,

        empresas,
        centrosCosto,

        /* Cargas */

        loading,
        loadingEmpresas,
        loadingCentrosCosto,

        /* Filtros */

        busqueda,
        setBusqueda,
        empresaFiltro,
        setEmpresaFiltro,
        tipoCentroCostoFiltro,
        setTipoCentroCostoFiltro,
        centroCostoFiltro,
        setCentroCostoFiltro,
        estadoFiltro,
        setEstadoFiltro,
        cierreFiltro,
        setCierreFiltro,
        handleBusquedaChange,
        handleEmpresaFiltroChange,
        handleTipoCentroCostoFiltroChange,
        handleCentroCostoFiltroChange,
        handleEstadoFiltroChange,
        handleCierreFiltroChange,
        limpiarFiltros,
        campanasFiltradas,


        /* Paginación */

        pagina,
        setPagina,
        registrosPorPagina,
        setRegistrosPorPagina,
        campanasPaginadas,

        /* Formulario */

        formulario,
        setFormulario,
        formularioInicial,
        ultimaCampanaCentroCosto,
        modalAbierto,
        modoEdicion,
        campanaSeleccionada,
        errorFormulario,
        setErrorFormulario,

        /* Operaciones */
        guardando,
        eliminando,
        campanaCambioEstado,
        cambiandoEstado,

        /* Exportar Excel */

        exportandoExcel,
        handleExportarExcel,

        /* Contexto */

        esModoContextual,
        codCcPkContextual,

        /* Acciones */

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
        recargarCampanas,
        cargarDatos,
        cargarCentrosCosto,

        /* Mensajes */

        snackbar,
        mostrarMensaje,
        cerrarSnackbar,

        /* Errores */

        obtenerMensajeError: obtenerMensajeErrorCampana,
    }
}

export default useCampana
