import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'

import {
  Edit as EditIcon,
} from '@mui/icons-material'

const COLORES_EMPRESA = {
  RANCHO: '#1976D2',
  'MOCHE NORTE': '#2E7D32',
  SAMNSA: '#2E7D32',
  MCR: '#9C27B0',
  CANTERA: '#ED6C02',
}

function obtenerColorEmpresa(
  nombreComercial,
) {
  return (
    COLORES_EMPRESA[
      nombreComercial
    ] ?? '#BDBDBD'
  )
}

function obtenerNombreEmpresas(
  usuario,
) {
  const empresas =
    (usuario.usuario_empresa ?? [])
      .filter(
        (empresa) =>
          empresa.estado === true,
      )
      .map(
        (empresa) =>
          empresa.empresa
            ?.nombre_comercial,
      )
      .filter(Boolean)

  return empresas
}

function obtenerTextoEmpresas(
  usuario,
) {
  const empresas =
    obtenerNombreEmpresas(usuario)

  if (usuario.permiso?.nombre === 'ADMIN') {
    return 'Todas'
  }

  if (empresas.length === 0) {
    return 'Sin asignar'
  }

  return empresas.join(', ')
}

function obtenerColorEstado(
  estado,
) {
  if (estado === 'ACTIVO') {
    return {
      punto: '#66BB6A',
      texto: '#388E3C',
    }
  }

  if (estado === 'PENDIENTE') {
    return {
      punto: '#FFB74D',
      texto: '#E65100',
    }
  }

  return {
    punto: '#EF9A9A',
    texto: '#C62828',
  }
}

function obtenerTextoEstado(
  estado,
) {
  switch (estado) {
    case 'ACTIVO':
      return 'Activo'

    case 'PENDIENTE':
      return 'Pendiente'

    case 'INACTIVO':
      return 'Inactivo'

    default:
      return estado ?? ''
  }
}

function UsuarioTable({
  usuarios = [],
  loading = false,
  pagina = 0,
  filasPorPagina = 10,
  total = 0,
  onCambiarPagina,
  onCambiarFilasPorPagina,
  onEditar,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
      }}
    >
      <TableContainer
        sx={{
          flex: '1 1 0%',
          minWidth: 0,
          minHeight: 0,
          overflowX: 'auto',
          overflowY: 'auto',
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            width: '100%',
            minWidth: 760,
            tableLayout: 'fixed',

            '& .MuiTableCell-root': {
              fontSize: 13,
              py: 1,
              px: 1.25,
              borderColor: '#E0E5E2',
            },

            '& .MuiTableCell-head': {
              fontWeight: 700,
              backgroundColor: '#F8FAF9',
              color: 'text.primary',
              whiteSpace: 'nowrap',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: '15%',
                }}
              >
                Nombre
              </TableCell>

              <TableCell
                sx={{
                  width: '15%',
                }}
              >
                Apellido
              </TableCell>

              <TableCell
                sx={{
                  width: '18%',
                }}
              >
                Permiso
              </TableCell>

              <TableCell
                sx={{
                  width: '24%',
                }}
              >
                Empresas
              </TableCell>

              <TableCell
                sx={{
                  width: '12%',
                }}
              >
                Estado
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  width: '8%',
                }}
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
                  sx={{
                    py: 5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Cargando usuarios...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : usuarios.length ===
              0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    py: 5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No se encontraron
                    usuarios.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map(
                (usuario) => {
                  const empresas =
                    obtenerNombreEmpresas(
                      usuario,
                    )

                  const empresasTexto =
                    obtenerTextoEmpresas(
                      usuario,
                    )

                  const estado =
                    obtenerColorEstado(
                      usuario.estado,
                    )

                  const colorEmpresa =
                    usuario.permiso
                      ?.nombre ===
                    'ADMIN'
                      ? '#2E7D32'
                      : obtenerColorEmpresa(
                          empresas[0],
                        )

                  return (
                    <TableRow
                      key={
                        usuario.id_usuario
                      }
                      hover
                      sx={{
                        '&:last-child td':
                          {
                            borderBottom: 0,
                          },
                      }}
                    >
                      {/* Nombre */}
                      <TableCell
                        sx={{
                          position:
                            'relative',
                          pl: '20px !important',
                        }}
                      >
                        <Box
                          sx={{
                            position:
                              'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            backgroundColor:
                              colorEmpresa,
                          }}
                        />

                        <Typography
                          variant="body2"
                          noWrap
                          title={
                            usuario.nombre ??
                            ''
                          }
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {usuario.nombre ||
                            '—'}
                        </Typography>
                      </TableCell>

                      {/* Apellido */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          title={
                            usuario.apellido ??
                            ''
                          }
                          sx={{
                            fontSize: 13,
                          }}
                        >
                          {usuario.apellido ||
                            '—'}
                        </Typography>
                      </TableCell>

                      {/* Permiso */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          title={
                            usuario
                              .permiso
                              ?.descripcion ??
                            usuario
                              .permiso
                              ?.nombre ??
                            ''
                          }
                          sx={{
                            fontSize: 13,
                          }}
                        >
                          {usuario
                            .permiso
                            ?.nombre ||
                            'Sin asignar'}
                        </Typography>
                      </TableCell>

                      {/* Empresas */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          title={
                            empresasTexto
                          }
                          sx={{
                            fontSize: 13,
                            color:
                              empresas.length ===
                              0 &&
                              usuario
                                .permiso
                                ?.nombre !==
                                'ADMIN'
                                ? 'text.secondary'
                                : 'text.primary',
                          }}
                        >
                          {empresasTexto}
                        </Typography>
                      </TableCell>

                      {/* Estado */}
                      <TableCell>
                        <Box
                          sx={{
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            gap: 0.75,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius:
                                '50%',
                              backgroundColor:
                                estado.punto,
                              flexShrink: 0,
                            }}
                          />

                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: 13,
                              color:
                                estado.texto,
                              fontWeight: 500,
                            }}
                          >
                            {obtenerTextoEstado(
                              usuario.estado,
                            )}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Acción */}
                      <TableCell align="center">
                        <Tooltip title="Editar usuario">
                          <IconButton
                            
                            onClick={() =>
                              onEditar(
                                usuario,
                              )
                            }
                            disabled={
                              loading
                            }
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                            }}
                          >
                            <EditIcon
                              sx={{
                                fontSize: 20,
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                },
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={pagina}
        onPageChange={
          onCambiarPagina
        }
        rowsPerPage={
          filasPorPagina
        }
        onRowsPerPageChange={
          onCambiarFilasPorPagina
        }
        rowsPerPageOptions={[
          10,
          25,
          50,
          100,
        ]}
        labelRowsPerPage="Filas:"
        labelDisplayedRows={({
          from,
          to,
          count,
        }) =>
          `${from}-${to} de ${count}`
        }
        sx={{
          flexShrink: 0,
          borderTop: 1,
          borderColor: 'divider',

          '& .MuiTablePagination-toolbar':
            {
              minHeight: 48,
              px: 1.5,
            },
        }}
      />
    </Paper>
  )
}

export default UsuarioTable