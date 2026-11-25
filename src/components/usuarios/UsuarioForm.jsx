// Presenta formularios y diálogos de Usuario.
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { obtenerEtiquetaPermiso } from './usuarioRules'
import SearchableSelect from '../common/SearchableSelect'
import useUsuarioForm from '../../hooks/useUsuarioForm'
import UsuarioEmpresasField from './UsuarioEmpresasField'
import {
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material'


function UsuarioForm({
  open,
  usuario,
  permisos = [],
  empresas = [],
  guardando = false,
  onClose,
  onSave,
}) {
  const { esEdicion, formulario, errores, esAdmin, manejarCambio, manejarPermiso, manejarGuardar } = useUsuarioForm({ open, usuario, permisos, guardando, onSave })



  return (
    <Dialog
      open={open}
      onClose={
        guardando
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 1.5,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            {esEdicion
              ? 'Editar usuario'
              : 'Nuevo usuario'}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
            }}
          >
            {esEdicion
              ? 'Actualiza los datos, permisos y empresas asignadas.'
              : 'Completa los datos del usuario.'}
          </Typography>
        </Box>

        <Button
          onClick={onClose}
          disabled={guardando}
          color="inherit"
          sx={{
            minWidth: 36,
            width: 36,
            height: 36,
            borderRadius: 1,
            p: 0,
          }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
        }}
      >
        <Stack spacing={2}>

          {esEdicion &&
            usuario?.auth_user_id && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                >
                  La cuenta de acceso está
                  administrada por
                  <strong>
                    {' '}
                    Supabase Auth
                  </strong>
                  . Desde aquí se administra
                  el perfil, permiso, estado y
                  empresas.
                </Typography>
              </Alert>
            )}


          {/* Datos del usuario */}

          {!esEdicion && (
            <TextField
              label="Correo electrónico"
              value={
                formulario.email
              }
              onChange={(event) =>
                manejarCambio(
                  'email',
                  event.target.value,
                )
              }
              error={Boolean(
                errores.email,
              )}
              helperText={
                errores.email ||
                'Se enviará una invitación a este correo.'
              }
              fullWidth
              size="small"
              type="email"
              autoComplete="email"
              disabled={guardando}
            />
          )}


          {esEdicion &&
            usuario?.auth_user_id && (
              <TextField
                label="Correo electrónico"
                value={
                  usuario.email ??
                  ''
                }
                fullWidth
                size="small"
                disabled
                helperText="El correo se administra desde Supabase Auth."
              />
            )}


          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            <TextField
              label="Nombre"
              value={
                formulario.nombre
              }
              onChange={(event) =>
                manejarCambio(
                  'nombre',
                  event.target.value,
                )
              }
              error={Boolean(
                errores.nombre,
              )}
              helperText={
                errores.nombre
              }
              fullWidth
              size="small"
              disabled={guardando}
            />

            <TextField
              label="Apellido"
              value={
                formulario.apellido
              }
              onChange={(event) =>
                manejarCambio(
                  'apellido',
                  event.target.value,
                )
              }
              fullWidth
              size="small"
              disabled={guardando}
            />
          </Box>


          {/* Permiso y estado */}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 2,
            }}
          >
            <SearchableSelect
              label="Permiso"
              value={formulario.id_permiso}
              options={permisos}
              getOptionValue={(permiso) => String(permiso.id_permiso)}
              getOptionLabel={(permiso) => obtenerEtiquetaPermiso(permiso.nombre)}
              onChange={manejarPermiso}
              error={Boolean(errores.id_permiso)}
              helperText={errores.id_permiso}
              disabled={guardando}
            />


            <FormControl
              fullWidth
              size="small"
              disabled={guardando}
            >
              <InputLabel>
                Estado
              </InputLabel>

              <Select
                value={
                  formulario.estado
                }
                label="Estado"
                onChange={(event) =>
                  manejarCambio(
                    'estado',
                    event.target.value,
                  )
                }
              >
                <MenuItem value="ACTIVO">
                  Activo
                </MenuItem>

                <MenuItem value="PENDIENTE">
                  Pendiente
                </MenuItem>

                <MenuItem value="INACTIVO">
                  Inactivo
                </MenuItem>
              </Select>
            </FormControl>
          </Box>


          {/* Empresas asignadas */}

          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{
                mb: 1,
              }}
            >
              Acceso a empresas
            </Typography>

            <UsuarioEmpresasField esAdmin={esAdmin} empresas={empresas} formulario={formulario} errores={errores} manejarCambio={manejarCambio} />
          </Box>

        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={guardando}
          variant="outlined"
          color="inherit"
          sx={{
            height: 40,
            minWidth: 110,
            borderRadius: 1,
          }}
        >
          Cancelar
        </Button>

        <Button
          onClick={manejarGuardar}
          variant="contained"
          disabled={guardando}
          startIcon={
            guardando ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            height: 40,
            minWidth: 140,
            borderRadius: 1,
          }}
        >
          {guardando
            ? 'Guardando...'
            : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}


export default UsuarioForm
