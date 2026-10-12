// =========================================================
// IMPORTS
// =========================================================

import { useEffect, useRef, useMemo, useState } from 'react'
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, Paper, Snackbar, TextField, Typography
} from '@mui/material'

import { Add, Close as CloseIcon, Edit as EditIcon, Save } from '@mui/icons-material'

import { obtenerTiposMaquinaria, crearTipoMaquinaria, actualizarTipoMaquinaria } from '../../services/tipoMaquinariaService'

import SearchInput from '../../components/common/SearchInput'
import StatusChip from '../../components/common/StatusChip'
import Pagination from '../../components/common/Pagination'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'


const formularioInicial = { des_tipo_maquinaria: '', estado: true }


function TiposMaquinaria() {

    const [tiposMaquinaria, setTiposMaquinaria] = useState([])
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null)

    // =========================================================
    // DATOS - DIÁLOGO - FORMULARIO - BÚSQUEDA - PAGINACIÓN&& NO EDITABLE
    // =========================================================

    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const [dialogOpen, setDialogOpen] = useState(false)
    const [modoEdicion, setModoEdicion] = useState(false)

    const [formulario, setFormulario] = useState(formularioInicial)
    const [erroresFormulario, setErroresFormulario] = useState({})

    const [busqueda, setBusqueda] = useState('')

    const [pagina, setPagina] = useState(0)
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10)

    const cargaInicialIniciada = useRef(false)

    // =========================================================
    // CARGAR TIPOS MAQUINARIAS
    // 

    const cargarTiposMaquinaria = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await obtenerTiposMaquinaria()
            setTiposMaquinaria(data || [])
        }
        catch (err) {
            console.error('Error cargando tipos de maquinaria:', err)
            setError('No se pudieron cargar los tipos de maquinaria.')
        }
        finally { setLoading(false) }
    }


    useEffect(() => {
        if (cargaInicialIniciada.current) { return }
        cargaInicialIniciada.current = true
        cargarTiposMaquinaria()
    },
        [])

    // =========================================================
    // DATOS FILTRADOS
    // =========================================================

    const tiposMaquinariaFiltrados =
        useMemo(() => {
            const texto = busqueda.trim().toLowerCase()
            if (!texto) { return tiposMaquinaria }

            return tiposMaquinaria.filter(
                (tipo) =>
                    tipo.des_tipo_maquinaria?.toLowerCase().includes(texto))
        }
            , [tiposMaquinaria, busqueda])

    // =========================================================
    // TIPOS DE MAQUINARIA PAGINADO
    // =========================================================

    const tiposMaquinariaPaginados =
        useMemo(() => {
            const inicio = pagina * registrosPorPagina
            const fin = inicio + registrosPorPagina
            return tiposMaquinariaFiltrados.slice(inicio, fin)
        },
            [tiposMaquinariaFiltrados, pagina, registrosPorPagina])

    // =========================================================
    // CAMBIO DE BÚSQUEDA - CAMBIO DE PÁGINA - CAMBIO DE REGISTROS POR PÁGINA && NO EDITABLE
    // =========================================================
    const handleCambioBusqueda = (
        event,
    ) => {
        setBusqueda(event.target.value)
        setPagina(0)
    }

    const handleChangePagina = (
        event,
        nuevaPagina,
    ) => {
        setPagina(nuevaPagina)
    }

    const handleChangeRegistrosPorPagina = (
        event
    ) => {
        setRegistrosPorPagina(
            parseInt(
                event.target.value, 10))
        setPagina(0)
    }

    // =========================================================
    // NUEVO TIPO DE CENTRO DE COSTO
    // =========================================================


    const handleNuevoTipo = () => {
        setModoEdicion(false)
        setTipoSeleccionado(null)
        setFormulario({ ...formularioInicial, estado: true })
        setErroresFormulario({})
        setDialogOpen(true)
    }

    // =========================================================
    // EDITAR TIPO DE CENTRO DE COSTO
    // =========================================================

    const handleEditarTipo = (
        tipo,
    ) => {
        setModoEdicion(true)
        setTipoSeleccionado(tipo)
        setFormulario({
            des_tipo_maquinaria: tipo.des_tipo_maquinaria || '',
            estado: tipo.estado ?? true
        })
        setErroresFormulario({})
        setDialogOpen(true)
    }

    // =========================================================
    // CERRAR DIÁLOGO 
    // =========================================================

    const handleCerrarDialog = () => {
        if (guardando) { return }
        setDialogOpen(false)
        setTipoSeleccionado(null)
        setFormulario(formularioInicial)
        setErroresFormulario({})
    }

    // =========================================================
    // CAMBIAR CAMPOS
    // =========================================================

    const handleChange = (event) => {
        const { name, value } = event.target
        const nuevoValor = name === 'des_tipo_maquinaria' ? value.toUpperCase() : value
        setFormulario((prev) => ({ ...prev, [name]: nuevoValor }))
        setErroresFormulario((prev) => ({ ...prev, [name]: '' }))
    }

    // =========================================================
    // CAMBIAR ESTADO && NO EDITABLE
    // =========================================================

    const handleCambiarEstadoFormulario =
        () => {
            setFormulario((prev) => ({
                ...prev,
                estado: !prev.estado,
            }))
        }

    // =========================================================
    // VALIDAR FORMULARIO
    // =========================================================

    const validarFormulario = () => {
        const nuevosErrores = {}
        if (!formulario.des_tipo_maquinaria.trim()) { nuevosErrores.des_tipo_maquinaria = 'La descripción es obligatoria.' }
        setErroresFormulario(nuevosErrores)
        return (Object.keys(nuevosErrores).length === 0)
    }

    // =========================================================
    // GUARDAR COMPARATIVO
    // =========================================================


    const handleGuardar = async () => {
        if (!validarFormulario()) { return }
        try {
            setGuardando(true)
            setError('')
            const datos = {
                des_tipo_maquinaria: formulario.des_tipo_maquinaria.trim().toUpperCase(),
                estado: formulario.estado
            }
            if (modoEdicion) {
                await actualizarTipoMaquinaria(tipoSeleccionado.id_tipo_maq, datos)
                setMensaje('Tipo de maquinaria actualizado correctamente.')
            }
            else {
                await crearTipoMaquinaria(datos)
                setMensaje('Tipo de maquinaria creado correctamente.')
                setPagina(0)
            }
            setDialogOpen(false)
            await cargarTiposMaquinaria()
        } catch (err) {
            console.error('Error guardando tipo de maquinaria:', err)
            setError(err?.message || 'No se pudo guardar el tipo de maquinaria.')

        } finally { setGuardando(false) }
    }

    // =========================================================
    // CERRAR MENSAJES && NO EDITABLE
    // =========================================================

    const handleCerrarMensaje = () => { setMensaje('') }
    const handleCerrarError = () => { setError('') }

    // =========================================================
    // COLUMNAS DEL DATATABLE
    // =========================================================
    const columnas = [
        {
            key: 'des_tipo_maquinaria',
            label: 'Tipo de Maquinaria',
            height: '100%',
            width: '60%',
            cellSx: {
                position: 'relative', pl: 1.5,
                '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: '0 0px 0px 0', backgroundColor: '#2E7D32' }
            },
            render: (tipo) => (
                <Box sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
                        {tipo.des_tipo_maquinaria}
                    </Typography>
                </Box>)
        },
        {
            key: 'estado',
            label: 'Estado',
            width: '20%',
            render: (tipo) => (
                <StatusChip estado={tipo.estado} activoLabel="Activo" inactivoLabel="Inactivo" />
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '20%',
            align: 'center',
            render: (tipo) => (
                <IconButton size="small" onClick={() => handleEditarTipo(tipo)}
                    sx={{ p: 0.5, '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } }}>
                    <EditIcon fontSize="small" />
                </IconButton>
            ),
        },
    ]

    // =========================================================
    // TOTAL
    // =========================================================

    const totalRegistros = tiposMaquinariaFiltrados.length


    // =========================================================
    // RENDER 
    // =========================================================


    return (

        <Box sx={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* =====================================================
            ENCABEZADO
                    ====================================================== */}

            <PageHeader
                title="Tipos de Maquinaria"
                description="Administración de tipos de maquinaria agrícola"
                actionLabel="Nuevo tipo de maquinaria"
                onAction={handleNuevoTipo}
                actionIcon={<Add />}
            />


            <Paper
                elevation={0}
                sx={{
                    width: '100%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 1,
                    overflow: 'hidden', backgroundColor: 'background.paper', marginBottom: 1
                }}>

                {/* =====================================================
                    BUSCADOR
                ====================================================== */}
                <Box sx={{ p: 2, flexShrink: 0, backgroundColor: 'background.paper' }}>

                    <SearchInput
                        value={busqueda.toLocaleUpperCase()}
                        onChange={handleCambioBusqueda}
                        placeholder="Buscar tipo de maquinaria..."
                        ariaLabel="Buscar tipo de maquinaria"
                    />
                </Box>

                {/* =================================================
                    ERROR && NO EDITABLE
                ================================================= */}

                {error && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Alert severity="error" sx={{ borderRadius: 1 }} >
                            {error}
                        </Alert>
                    </Box>
                )}
            </Paper>

            {/* =================================================
                    TABLA 
                ================================================= */}
            <Paper
                elevation={0}
                sx={{
                    width: '100%', minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column',
                    border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden', backgroundColor: 'background.paper'
                }}>



                {/* ===================================================
            TABLA
        ==================================================== */}

                <DataTable
                    columns={columnas}
                    rows={tiposMaquinariaPaginados}
                    loading={loading}
                    emptyMessage={'No existen tipos de centro de costo maquinaria registrados.'}
                    emptySearchMessage={'No se encontraron tipos de centro de costo maquinaria para la búsqueda.'}
                    hasSearch={Boolean(busqueda.trim())}
                    getRowKey={(tipo) => tipo.id_tipo_maq}
                />

                {/* =================================================
                    PAGINACIÓN
                ================================================= */}

                <Pagination
                    total={totalRegistros}
                    pagina={pagina}
                    registrosPorPagina={registrosPorPagina}
                    onPageChange={handleChangePagina}
                    onRowsPerPageChange={handleChangeRegistrosPorPagina}
                />
            </Paper>


            {/* =====================================================
                DIÁLOGO && NO EDITABLE
            ====================================================== */}


            <Dialog open={dialogOpen} onClose={handleCerrarDialog} fullWidth maxWidth="sm">
                {/* =====================================================
                FORMULARIO DE NUEVO / ACTUALIZAR
                ====================================================== */}

                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>

                    <Typography variant="h6" fontWeight={700}>
                        {modoEdicion
                            ? 'Editar tipo de maquinaria'
                            : 'Nuevo tipo de maquinaria'}
                    </Typography>

                    <IconButton onClick={handleCerrarDialog} disabled={guardando} size="small">
                        <CloseIcon />
                    </IconButton>

                </DialogTitle>

                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

                        {/* ===============================================
              DESCRIPCIÓN
          ================================================ */}

                        <TextField
                            label="Tipo de maquinaria"
                            name="des_tipo_maquinaria"
                            value={formulario.des_tipo_maquinaria}
                            onChange={handleChange}
                            error={Boolean(erroresFormulario.des_tipo_maquinaria)}
                            helperText={erroresFormulario.des_tipo_maquinaria || 'La descripción se guardará en mayúsculas.'}
                            fullWidth
                            required
                            sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            disabled={guardando}
                            autoFocus
                        />
                        {/* =====================================================
                ESTADO
            ====================================================== */}

                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                                Estado
                            </Typography>

                            <StatusChip
                                estado={formulario.estado}
                                onClick={!guardando ? handleCambiarEstadoFormulario : undefined}
                                disabled={guardando}
                            />
                        </Box>
                    </Box>

                </DialogContent>

                {/* =====================================================
                BOTON DE CERRAR && NO EDITABLE
            ====================================================== */}

                <DialogActions sx={{ px: 3, pb: 2 }}>

                    <Button onClick={handleCerrarDialog}
                        disabled={guardando}
                        startIcon={<CloseIcon />}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>
                        Cancelar
                    </Button>

                    {/* =====================================================
                BOTÓN DE GUARDAR
            ====================================================== */}

                    <Button variant="contained" onClick={handleGuardar}
                        disabled={guardando}
                        startIcon={guardando ? (<CircularProgress size={18} color="inherit" />) : (<Save />)}
                        sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>
                        {modoEdicion
                            ? 'Guardar cambios'
                            : 'Guardar'}
                    </Button>
                </DialogActions>

            </Dialog>

            {/* =====================================================
                NOTIFICACIONES && NO EDITABLE
            ====================================================== */}

            {/* =====================================================
          MENSAJE DE ÉXITO && NO EDITABLE
      ====================================================== */}

            <Snackbar
                open={Boolean(mensaje)}
                autoHideDuration={3500}
                onClose={handleCerrarMensaje}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} >

                <Alert
                    onClose={handleCerrarMensaje}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}>
                    {mensaje}
                </Alert>

            </Snackbar>

            {/* =====================================================
          MENSAJE ERROR && NO EDITABLE
      ====================================================== */}

            <Snackbar
                open={Boolean(error)}
                autoHideDuration={5000}
                onClose={handleCerrarError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >

                <Alert
                    onClose={handleCerrarError}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default TiposMaquinaria