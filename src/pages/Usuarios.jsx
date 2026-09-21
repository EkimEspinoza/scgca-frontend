import { useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'

import PageTitle from '../components/PageTitle'
import UsuarioForm from '../components/usuarios/UsuarioForm'

import { obtenerUsuarios } from '../services/usuarioService'


function obtenerPermiso(usuario) {
  return usuario.permiso?.nombre ?? 'SIN PERMISO'
}


function obtenerEmpresas(usuario) {
  if (obtenerPermiso(usuario) === 'ADMIN') {
    return 'Todas'
  }

  const empresas = (usuario.usuario_empresa ?? [])
    .filter((item) => item.estado === true)
    .map((item) => item.empresa?.nombre_comercial)
    .filter(Boolean)

  return empresas.length > 0
    ? empresas.join(', ')
    : 'Sin asignación'
}


function obtenerColorEstado(estado) {
  switch (estado) {
    case 'ACTIVO':
      return 'success'

    case 'PENDIENTE':
      return 'warning'

    case 'INACTIVO':
      return 'default'

    default:
      return 'default'
  }
}


function formatearFecha(fecha) {
  if (!fecha) return '-'

  return new Date(fecha).toLocaleDateString(
    'es-PE',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  )
}


export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroPermiso, setFiltroPermiso] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroEmpresa, setFiltroEmpresa] = useState('')

  const [pagina, setPagina] = useState(0)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  const [usuarioEditar, setUsuarioEditar] =
    useState(null)

  const [modalUsuario, setModalUsuario] =
    useState(false)

  const [recarga, setRecarga] = useState(0)

  const [notificacion, setNotificacion] =
    useState({
      open: false,
      mensaje: '',
      severity: 'success',
    })


  /*
   * Cargar usuarios
   */
  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await obtenerUsuarios()

      setUsuarios(data)
    } catch (err) {
      console.error(err)

      setError(
        err?.message ||
          'No se pudieron cargar los usuarios.',
      )
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    cargarUsuarios()
  }, [recarga])


  /*
   * Permisos disponibles
   */
  const permisos = useMemo(() => {
    const valores = usuarios
      .map((usuario) =>
        obtenerPermiso(usuario),
      )
      .filter(Boolean)

    return [...new Set(valores)].sort()
  }, [usuarios])


  /*
   * Empresas disponibles
   */
  const empresas = useMemo(() => {
    const mapa = new Map()

    usuarios.forEach((usuario) => {
      ;(usuario.usuario_empresa ?? []).forEach(
        (item) => {
          if (
            item.estado === true &&
            item.empresa
          ) {
            mapa.set(
              item.empresa.id_empresa,
              item.empresa,
            )
          }
        },
      )
    })

    return [...mapa.values()].sort(
      (a, b) =>
        a.nombre_comercial.localeCompare(
          b.nombre_comercial,
          'es',
          {
            sensitivity: 'base',
          },
        ),
    )
  }, [usuarios])


  /*
   * Filtrar usuarios
   */
  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLocaleUpperCase('es')

    return usuarios.filter((usuario) => {
      /*
       * Buscar por nombre o apellido
       */
      if (texto) {
        const nombreCompleto = [
          usuario.nombre,
          usuario.apellido,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleUpperCase('es')

        if (!nombreCompleto.includes(texto)) {
          return false
        }
      }


      /*
       * Permiso
       */
      if (
        filtroPermiso &&
        obtenerPermiso(usuario) !==
          filtroPermiso
      ) {
        return false
      }


      /*
       * Estado
       */
      if (
        filtroEstado &&
        usuario.estado !== filtroEstado
      ) {
        return false
      }


      /*
       * Empresa
       */
      if (filtroEmpresa) {
        if (
          obtenerPermiso(usuario) ===
          'ADMIN'
        ) {
          return true
        }

        const tieneEmpresa =
          (
            usuario.usuario_empresa ?? []
          ).some(
            (item) =>
              item.estado === true &&
              String(item.id_empresa) ===
                String(filtroEmpresa),
          )

        if (!tieneEmpresa) {
          return false
        }
      }

      return true
    })
  }, [
    usuarios,
    busqueda,
    filtroPermiso,
    filtroEstado,
    filtroEmpresa,
  ])


  /*
   * Volver a primera página
   * al cambiar filtros.
   */
  useEffect(() => {
    setPagina(0)
  }, [
    busqueda,
    filtroPermiso,
    filtroEstado,
    filtroEmpresa,
  ])


  /*
   * Abrir edición
   */
  const handleEditar = (usuario) => {
    setUsuarioEditar(usuario)
    setModalUsuario(true)
  }


  /*
   * Cerrar formulario
   */
  const handleCerrarFormulario = () => {
    setModalUsuario(false)
    setUsuarioEditar(null)
  }


  /*
   * Usuario actualizado
   */
  const handleUsuarioGuardado = () => {
    setRecarga(
      (valor) => valor + 1,
    )

    setNotificacion({
      open: true,
      mensaje:
        'Usuario actualizado correctamente.',
      severity: 'success',
    })
  }


  /*
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroPermiso('')
    setFiltroEstado('')
    setFiltroEmpresa('')
    setPagina(0)
  }


  /*
   * Cerrar notificación
   */
  const handleCerrarNotificacion = () => {
    setNotificacion(
      (actual) => ({
        ...actual,
        open: false,
      }),
    )
  }


  return (
    <Box>
      <PageTitle
        title="Usuarios"
        subtitle="Administración de usuarios y permisos"
      />


      {/* FILTROS */}
      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          mb: 2,
          border: (theme) =>
            `1px solid ${theme.scgca.border.main}`,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: '2fr 1fr 1fr 1fr auto',
            },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          {/* BUSCAR */}
          <TextField
            fullWidth
            size="small"
            label="Buscar usuario"
            placeholder="Nombre o apellido"
            value={busqueda}
            onChange={(event) =>
              setBusqueda(
                event.target.value,
              )
            }
            slotProps={{
              input: {
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={{
                      mr: 1,
                      color:
                        'text.secondary',
                    }}
                  />
                ),
              },
            }}
          />


          {/* PERMISO */}
          <FormControl
            fullWidth
            size="small"
          >
            <InputLabel>
              Permiso
            </InputLabel>

            <Select
              value={filtroPermiso}
              label="Permiso"
              onChange={(event) =>
                setFiltroPermiso(
                  event.target.value,
                )
              }
            >
              <MenuItem value="">
                Todos
              </MenuItem>

              {permisos.map((permiso) => (
                <MenuItem
                  key={permiso}
                  value={permiso}
                >
                  {permiso}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          {/* ESTADO */}
          <FormControl
            fullWidth
            size="small"
          >
            <InputLabel>
              Estado
            </InputLabel>

            <Select
              value={filtroEstado}
              label="Estado"
              onChange={(event) =>
                setFiltroEstado(
                  event.target.value,
                )
              }
            >
              <MenuItem value="">
                Todos
              </MenuItem>

              <MenuItem value="ACTIVO">
                ACTIVO
              </MenuItem>

              <MenuItem value="PENDIENTE">
                PENDIENTE
              </MenuItem>

              <MenuItem value="INACTIVO">
                INACTIVO
              </MenuItem>
            </Select>
          </FormControl>


          {/* EMPRESA */}
          <FormControl
            fullWidth
            size="small"
          >
            <InputLabel>
              Empresa
            </InputLabel>

            <Select
              value={filtroEmpresa}
              label="Empresa"
              onChange={(event) =>
                setFiltroEmpresa(
                  event.target.value,
                )
              }
            >
              <MenuItem value="">
                Todas
              </MenuItem>

              {empresas.map((empresa) => (
                <MenuItem
                  key={empresa.id_empresa}
                  value={empresa.id_empresa}
                >
                  {empresa.nombre_comercial}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          {/* LIMPIAR */}
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ClearIcon />}
            onClick={limpiarFiltros}
            sx={{
              minWidth: 110,
              height: 40,
            }}
          >
            Limpiar
          </Button>
        </Box>
      </Paper>


      {/* ENCABEZADO DE TABLA */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 1.5,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disabled
        >
          Nuevo usuario
        </Button>
      </Box>


      {/* ERROR */}
      {error && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            border: (theme) =>
              `1px solid ${theme.scgca.border.main}`,
            borderRadius: 2,
          }}
        >
          <Alert severity="error">
            {error}
          </Alert>
        </Paper>
      )}


      {/* TABLA */}
      <Paper
        elevation={0}
        sx={{
          border: (theme) =>
            `1px solid ${theme.scgca.border.main}`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <TableContainer
          sx={{
            maxHeight:
              'calc(100vh - 390px)',
            overflowX: 'auto',
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 1050,
              tableLayout: 'fixed',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ width: 220 }}
                >
                  Usuario
                </TableCell>

                <TableCell
                  sx={{ width: 130 }}
                >
                  Permiso
                </TableCell>

                <TableCell
                  sx={{ width: 300 }}
                >
                  Empresas
                </TableCell>

                <TableCell
                  sx={{ width: 120 }}
                >
                  Estado
                </TableCell>

                <TableCell
                  sx={{ width: 130 }}
                >
                  Fecha de registro
                </TableCell>

                <TableCell
                  align="center"
                  sx={{ width: 80 }}
                >
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>


            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 5 }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Cargando usuarios...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : usuariosFiltrados.length ===
                0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 5 }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      No se encontraron
                      usuarios con los filtros
                      seleccionados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados
                  .slice(
                    pagina *
                      filasPorPagina,
                    pagina *
                        filasPorPagina +
                      filasPorPagina,
                  )
                  .map((usuario) => (
                    <TableRow
                      key={
                        usuario.id_usuario
                      }
                      hover
                    >
                      {/* USUARIO */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {[
                            usuario.nombre,
                            usuario.apellido,
                          ]
                            .filter(Boolean)
                            .join(' ') || '-'}
                        </Typography>
                      </TableCell>


                      {/* PERMISO */}
                      <TableCell>
                        <Chip
                          label={obtenerPermiso(
                            usuario,
                          )}
                          size="small"
                          color={
                            obtenerPermiso(
                              usuario,
                            ) === 'ADMIN'
                              ? 'primary'
                              : 'default'
                          }
                        />
                      </TableCell>


                      {/* EMPRESAS */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                          }}
                          title={obtenerEmpresas(
                            usuario,
                          )}
                        >
                          {obtenerEmpresas(
                            usuario,
                          )}
                        </Typography>
                      </TableCell>


                      {/* ESTADO */}
                      <TableCell>
                        <Chip
                          label={
                            usuario.estado
                          }
                          size="small"
                          color={obtenerColorEstado(
                            usuario.estado,
                          )}
                        />
                      </TableCell>


                      {/* FECHA */}
                      <TableCell>
                        <Typography variant="body2">
                          {formatearFecha(
                            usuario.created_at,
                          )}
                        </Typography>
                      </TableCell>


                      {/* ACCIÓN */}
                      <TableCell align="center">
                        <Tooltip title="Editar usuario">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              handleEditar(
                                usuario,
                              )
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>


        <TablePagination
          component="div"
          count={
            usuariosFiltrados.length
          }
          page={pagina}
          onPageChange={(
            _,
            nuevaPagina,
          ) =>
            setPagina(nuevaPagina)
          }
          rowsPerPage={
            filasPorPagina
          }
          onRowsPerPageChange={(
            event,
          ) => {
            setFilasPorPagina(
              Number(
                event.target.value,
              ),
            )

            setPagina(0)
          }}
          rowsPerPageOptions={[
            10,
            25,
            50,
          ]}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>


      {/* FORMULARIO DE USUARIO */}
      <UsuarioForm
        open={modalUsuario}
        usuarioEditar={
          usuarioEditar
        }
        permisos={usuarios
          .map(
            (usuario) =>
              usuario.permiso,
          )
          .filter(Boolean)
          .filter(
            (permiso, index, array) =>
              array.findIndex(
                (item) =>
                  item.id_permiso ===
                  permiso.id_permiso,
              ) === index,
          )}
        empresas={empresas}
        onClose={
          handleCerrarFormulario
        }
        onSaved={
          handleUsuarioGuardado
        }
      />


      {/* NOTIFICACIÓN */}
      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={
          handleCerrarNotificacion
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={
            handleCerrarNotificacion
          }
          severity={
            notificacion.severity
          }
          variant="filled"
          sx={{
            width: '100%',
          }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  )
}