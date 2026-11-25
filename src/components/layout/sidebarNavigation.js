// Define el componente reutilizable sidebarNavigation.
import { Assessment, Dashboard as DashboardIcon, Percent } from '@mui/icons-material'

export const sidebarGroupRoutes = {
  maestros: ['/empresas', '/etapa-costo', '/centro-costos', '/variedades', '/tipos-centro-costo', '/tipos-maquinaria', '/comparativos', '/tipo-cambio', '/campanas'],
  tareos: ['/mov-tareo'],
  manoObra: ['/grupo-labor', '/labor-final', '/labor', '/jornal', '/tipo-jornal', '/mov-mo'],
  servicios: ['/tipo-cuenta', '/cuenta-comparativo', '/cuenta'],
  accesos: ['/usuarios', '/modulos', '/permisos'],
}

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { text: 'Distribución', icon: Percent, path: '/distribucion', moduleCode: 'DISTRIBUCION' },
  { text: 'Reportes', icon: Assessment, path: '/reportes' },
]

const maestrosItems = [
  { text: 'Campañas', path: '/campanas', moduleCode: 'CAMPANAS', permissions: ['ADMIN'] },
  { text: 'Centro de Costos', path: '/centro-costos', moduleCode: 'CENTRO_COSTOS', permissions: ['ADMIN'] },
  { text: 'Comparativos', path: '/comparativos', moduleCode: 'COMPARATIVOS', permissions: ['ADMIN'] },
  { text: 'Empresas', path: '/empresas', moduleCode: 'EMPRESAS', permissions: ['ADMIN'] },
  { text: 'Etapa de Costo Inversión', path: '/etapa-costo', moduleCode: 'ETAPAS_COSTO', permissions: ['ADMIN'] },
  { text: 'Tipos de Centro de Costo', path: '/tipos-centro-costo', moduleCode: 'TIPOS_CENTRO_COSTO', permissions: ['ADMIN'] },
  { text: 'Tipos de Maquinaria', path: '/tipos-maquinaria', moduleCode: 'TIPOS_MAQUINARIA', permissions: ['ADMIN'] },
  { text: 'Variedades', path: '/variedades', moduleCode: 'VARIEDADES', permissions: ['ADMIN'] },
  { text: 'Tipo Cambio', path: '/tipo-cambio', moduleCode: 'TIPO_CAMBIO', permissions: ['ADMIN'] },
]

const tareosItems = [
  { text: 'Mov. Tareo', path: '/mov-tareo', moduleCode: 'MOV_TAREO', permissions: ['ADMIN'] },
]

const manoObraItems = [
  { text: 'Labor', path: '/labor', permissions: ['ADMIN'] },
  { text: 'Labor Final', path: '/labor-final', permissions: ['ADMIN'] },
  { text: 'Grupo Labor', path: '/grupo-labor', permissions: ['ADMIN'] },
  { text: 'Jornal', path: '/jornal', permissions: ['ADMIN'] },
  { text: 'Tipo de Jornal', path: '/tipo-jornal', permissions: ['ADMIN'] },
  { text: 'Mov. Mano de Obra', path: '/mov-mo', permissions: ['ADMIN'], separador: true },
]

const serviciosItems = [
  { text: 'Tipo de Cuenta', path: '/tipo-cuenta', permissions: ['ADMIN'] },
  { text: 'Cuenta Comparativo', path: '/cuenta-comparativo', permissions: ['ADMIN'] },
  { text: 'Cuenta', path: '/cuenta', permissions: ['ADMIN'] },
]

const accesosItems = [
  { text: 'Usuarios', path: '/usuarios' },
  { text: 'Módulos', path: '/modulos' },
  { text: 'Permisos', path: '/permisos' },
]

const puedeVerModulo = (perfil, permiso, moduleCode) => perfil?.modulos?.some((modulo) =>
  modulo.codigo === moduleCode && (permiso === 'ADMIN' || ['QUERY', 'WRITER'].includes(modulo.nivel)),
)

export function getVisibleSidebarItems(perfil, permiso) {
  const puedeVer = (item) => !item.permissions || item.permissions.includes(permiso)
  return {
    menuItems: menuItems.filter((item) => puedeVer(item) && (!item.moduleCode || puedeVerModulo(perfil, permiso, item.moduleCode))),
    maestrosItems: maestrosItems.filter((item) => puedeVer(item) && (!item.moduleCode || puedeVerModulo(perfil, permiso, item.moduleCode))),
    tareosItems: tareosItems.filter((item) => puedeVer(item) && puedeVerModulo(perfil, permiso, item.moduleCode)),
    manoObraItems: manoObraItems.filter(puedeVer),
    serviciosItems: serviciosItems.filter(puedeVer),
    accesosItems,
  }
}
