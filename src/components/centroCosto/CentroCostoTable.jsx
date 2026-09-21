import {
  Box,
  Chip,
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


function CentroCostoTable({
  centros,
  loading,
  total,
  pagina,
  registrosPorPagina,
  onChangePagina,
  onChangeRegistrosPorPagina,
  onEditar,
}) {
  /*
   * =========================================================
   * COLOR POR EMPRESA
   * =========================================================
   */
  const obtenerColorEmpresa = (
    nombreComercial,
  ) => {
    const nombre = (
      nombreComercial || ''
    ).toUpperCase()

    if (nombre.includes('RANCHO')) {
      return {
        backgroundColor: '#EAF4FC',
        hoverColor: '#E0EFFA',
        indicatorColor: '#1976D2',
      }
    }

    if (
      nombre.includes('MOCHE') ||
      nombre.includes('SAMNSA')
    ) {
      return {
        backgroundColor: '#EDF7EE',
        hoverColor: '#E3F2E5',
        indicatorColor: '#2E7D32',
      }
    }

    if (nombre.includes('MCR')) {
      return {
        backgroundColor: '#F7EDF8',
        hoverColor: '#F0E3F2',
        indicatorColor: '#8E44AD',
      }
    }

    if (nombre.includes('CANTERA')) {
      return {
        backgroundColor: '#FFF9E8',
        hoverColor: '#FFF4D5',
        indicatorColor: '#ED9C00',
      }
    }

    return {
      backgroundColor: '#FFFFFF',
      hoverColor: '#F8FAF9',
      indicatorColor: '#9CA3AF',
    }
  }


  /*
   * =========================================================
   * TEXTO CON VALOR POR DEFECTO
   * =========================================================
   */
  const mostrarValor = (
    valor,
  ) => {
    return valor || '-'
  }


  /*
   * =========================================================
   * ESTILO GENERAL DE CELDAS
   * =========================================================
   */
  const estiloCelda = {
    borderBottom: '1px solid',
    borderColor: 'divider',
    px: 1.75,
    py: 1.5,
  }


  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
      }}
    >
      {/* =====================================================
          CONTENEDOR DE TABLA
      ====================================================== */}
      <TableContainer
        sx={{
          maxHeight:
            'calc(100vh - 330px)',
          overflowX: 'auto',
          px: { xs: 0.5, md: 1 },
          pt: 1,
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            minWidth: 1150,
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: '0 4px',
          }}
        >

          {/* =================================================
              CABECERA
          ================================================== */}
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: 115,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.75,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  borderTopLeftRadius: 8,
                }}
              >
                Empresa
              </TableCell>

              <TableCell
                sx={{
                  width: 100,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.75,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Código CC
              </TableCell>

              <TableCell
                sx={{
                  width: 285,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.75,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Descripción
              </TableCell>

              <TableCell
                sx={{
                  width: 190,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.75,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Tipo CC
              </TableCell>

              <TableCell
                sx={{
                  width: 180,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.75,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Tipo Maquinaria
              </TableCell>

              <TableCell
                sx={{
                  width: 145,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.75,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Comparativo
              </TableCell>

              <TableCell
                sx={{
                  width: 165,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.75,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Variedad
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  width: 105,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.5,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Estado
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  width: 80,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  px: 1.25,
                  py: 1.5,
                  color: 'text.primary',
                  backgroundColor: '#F8FAF9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  borderTopRightRadius: 8,
                }}
              >
                Acción
              </TableCell>
            </TableRow>
          </TableHead>


          {/* =================================================
              CUERPO
          ================================================== */}
          <TableBody>

            {/* ===============================================
                CARGANDO
            ================================================ */}
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{
                    py: 7,
                    borderBottom: 'none',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Cargando centros de costo...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : centros.length === 0 ? (

              /* =============================================
                 SIN RESULTADOS
              ============================================== */
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{
                    py: 7,
                    borderBottom: 'none',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No se encontraron centros de costo.
                  </Typography>
                </TableCell>
              </TableRow>

            ) : (

              /* =============================================
                 REGISTROS
              ============================================== */
              centros.map((centro) => {
                const colores =
                  obtenerColorEmpresa(
                    centro.empresa
                      ?.nombre_comercial,
                  )

                return (
                  <TableRow
                    key={centro.cod_cc_pk}
                    hover
                    sx={{
                      backgroundColor:
                        colores.backgroundColor,

                      transition:
                        'background-color 0.15s ease',

                      '&:hover': {
                        backgroundColor:
                          colores.hoverColor,
                      },

                      '& td': {
                        borderBottom:
                          '1px solid',
                        borderColor:
                          'divider',
                      },

                      '& td:first-of-type': {
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                      },

                      '& td:last-of-type': {
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                      },
                    }}
                  >

                    {/* ======================================
                        EMPRESA
                    ======================================= */}
                    <TableCell
                      sx={{
                        ...estiloCelda,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: 5,
                            height: 28,
                            borderRadius: 4,
                            flexShrink: 0,
                            backgroundColor:
                              colores.indicatorColor,
                          }}
                        />

                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            overflow: 'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {mostrarValor(
                            centro.empresa
                              ?.nombre_comercial,
                          )}
                        </Typography>
                      </Box>
                    </TableCell>


                    {/* ======================================
                        CÓDIGO
                    ======================================= */}
                    <TableCell
                      sx={{
                        ...estiloCelda,
                        whiteSpace: 'nowrap',
                        fontVariantNumeric:
                          'tabular-nums',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontVariantNumeric:
                            'tabular-nums',
                        }}
                      >
                        {centro.cod_cc}
                      </Typography>
                    </TableCell>


                    {/* ======================================
                        DESCRIPCIÓN
                    ======================================= */}
                    <TableCell
                      sx={{
                        ...estiloCelda,
                        fontWeight: 500,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            'text.primary',
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                        title={
                          centro.desc_cc
                        }
                      >
                        {mostrarValor(
                          centro.desc_cc,
                        )}
                      </Typography>
                    </TableCell>


                    {/* ======================================
                        TIPO CC
                    ======================================= */}
                    <TableCell
                      sx={{
                        ...estiloCelda,
                        overflow: 'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                        title={
                          centro.tipo_cc
                            ?.des_tip_cc
                        }
                      >
                        {mostrarValor(
                          centro.tipo_cc
                            ?.des_tip_cc,
                        )}
                      </Typography>
                    </TableCell>


                    {/* ======================================
                        TIPO MAQUINARIA
                    ======================================= */}
                    <TableCell
                      sx={{
                        ...estiloCelda,
                        overflow: 'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                        title={
                          centro.tipo_maq
                            ?.des_tipo_maquinaria
                        }
                      >
                        {mostrarValor(
                          centro.tipo_maq
                            ?.des_tipo_maquinaria,
                        )}
                      </Typography>
                    </TableCell>


                    {/* ======================================
                        COMPARATIVO
                    ======================================= */}
                    <TableCell
                      sx={{
                        ...estiloCelda,
                        overflow: 'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                        title={
                          centro.comparativo
                            ?.descripcion
                        }
                      >
                        {mostrarValor(
                          centro.comparativo
                            ?.descripcion,
                        )}
                      </Typography>
                    </TableCell>


                    {/* ======================================
                        VARIEDAD
                    ======================================= */}
                    <TableCell
                      sx={{
                        ...estiloCelda,
                        overflow: 'hidden',
                        textOverflow:
                          'ellipsis',
                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                        title={
                          centro.variedad
                            ?.descripcion
                        }
                      >
                        {mostrarValor(
                          centro.variedad
                            ?.descripcion,
                        )}
                      </Typography>
                    </TableCell>


                    {/* ======================================
                        ESTADO
                    ======================================= */}
                    <TableCell
                      align="center"
                      sx={{
                        ...estiloCelda,
                      }}
                    >
                      <Chip
                        label={
                          centro.estado
                            ? 'Activo'
                            : 'Inactivo'
                        }
                        color={
                          centro.estado
                            ? 'success'
                            : 'default'
                        }
                        size="small"
                        sx={{
                          minWidth: 72,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>


                    {/* ======================================
                        ACCIÓN
                    ======================================= */}
                    <TableCell
                      align="center"
                      sx={{
                        ...estiloCelda,
                      }}
                    >
                      <Tooltip
                        title="Editar Centro de Costo"
                        arrow
                      >
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            onEditar(centro)
                          }
                          aria-label="Editar Centro de Costo"
                          sx={{
                            width: 34,
                            height: 34,
                            '&:hover': {
                              backgroundColor:
                                'action.hover',
                            },
                          }}
                        >
                          <EditIcon
                            fontSize="small"
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>


      {/* ===================================================
          PAGINACIÓN
      ==================================================== */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          px: 1,
        }}
      >
        <TablePagination
          component="div"
          count={total}
          page={pagina}
          onPageChange={
            onChangePagina
          }
          rowsPerPage={
            registrosPorPagina
          }
          onRowsPerPageChange={
            onChangeRegistrosPorPagina
          }
          rowsPerPageOptions={[
            10,
            25,
            50,
            100,
          ]}
          labelRowsPerPage="Registros por página"
          labelDisplayedRows={({
            from,
            to,
            count,
          }) =>
            `${from}-${to} de ${
              count !== -1
                ? count
                : `más de ${to}`
            }`
          }
        />
      </Box>
    </Paper>
  )
}


export default CentroCostoTable