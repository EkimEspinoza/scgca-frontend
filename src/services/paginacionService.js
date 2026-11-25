// Encapsula las operaciones de datos de paginacionService.
export async function obtenerTodasLasPaginas(consultaPorRango, tamanoPagina = 1000) {
  const filas = []
  for (let desde = 0; ; desde += tamanoPagina) {
    const { data, error } = await consultaPorRango(desde, desde + tamanoPagina - 1)
    if (error) throw error
    filas.push(...(data ?? []))
    if (!data?.length || data.length < tamanoPagina) return filas
  }
}

export async function obtenerPorIdsPaginado(ids, consultaPorIds, tamanoLote = 500) {
  const filas = []
  for (let inicio = 0; inicio < ids.length; inicio += tamanoLote) {
    const loteIds = ids.slice(inicio, inicio + tamanoLote)
    filas.push(...await obtenerTodasLasPaginas((desde, hasta) => consultaPorIds(loteIds, desde, hasta)))
  }
  return filas
}
