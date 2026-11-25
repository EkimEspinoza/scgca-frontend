// Ordena los usuarios visibles según la columna seleccionada.
const usuarioCollator = new Intl.Collator('es-PE', { numeric: true, sensitivity: 'base' })

export function ordenarUsuarios(usuarios, orden, obtenerTextoEmpresas) {
    if (!orden.campo) return usuarios
    const camposOrden = {
        nombre: (usuario) => usuario.nombre,
        apellido: (usuario) => usuario.apellido,
        permiso: (usuario) => usuario.permiso?.nombre,
        empresas: obtenerTextoEmpresas,
        estado: (usuario) => usuario.estado,
    }
    const obtenerValor = camposOrden[orden.campo]
    const factor = orden.direccion === 'asc' ? 1 : -1
    return [...usuarios].sort((a, b) => usuarioCollator.compare(String(obtenerValor(a) ?? ''), String(obtenerValor(b) ?? '')) * factor)
}
