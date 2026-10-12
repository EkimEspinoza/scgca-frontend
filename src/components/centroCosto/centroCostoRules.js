/*
 * ============================================================
 * REGLAS DEL MÓDULO CENTRO DE COSTO
 * ============================================================
 *
 * Este archivo concentra las reglas de negocio relacionadas
 * con la visibilidad y comportamiento de los filtros.
 *
 * Así evitamos mezclar reglas del negocio con la interfaz.
 */


/*
 * ============================================================
 * TIPOS DE CENTRO DE COSTO
 * ============================================================
 */

export const TIPOS_CC = {
  MAQUINARIA: 3,
  LEVANTE: 4,
  INVERSION_CAMPO: 15,
  VIVEROS: 16,
}


/*
 * ============================================================
 * VISIBILIDAD DE FILTROS
 * ============================================================
 */

/**
 * Determina si debe mostrarse el filtro
 * de tipo de maquinaria.
 */
export function mostrarTipoMaquinaria(
  tipoCcId,
) {
  return (
    Number(tipoCcId) ===
    TIPOS_CC.MAQUINARIA
  )
}


/**
 * Determina si debe mostrarse
 * el filtro comparativo.
 */
export function mostrarComparativo(
  tipoCcId,
) {
  return [
    TIPOS_CC.LEVANTE,
    TIPOS_CC.INVERSION_CAMPO,
  ].includes(
    Number(tipoCcId),
  )
}


/**
 * Determina si debe mostrarse
 * el filtro variedad.
 */
export function mostrarVariedad(
  tipoCcId,
) {
  return [
    TIPOS_CC.LEVANTE,
    TIPOS_CC.INVERSION_CAMPO,
    TIPOS_CC.VIVEROS,
  ].includes(
    Number(tipoCcId),
  )
}


/*
 * ============================================================
 * FILTROS QUE REINICIAN DEPENDENCIAS
 * ============================================================
 */

/**
 * Empresa y estado afectan la lista de
 * tipos de centro de costo disponibles.
 *
 * Por eso, cuando cambian, se deben
 * limpiar todos los filtros dependientes.
 */
export function requiereLimpiarFiltrosDependientes(
  filtro,
) {
  return [
    'empresa',
    'estado',
    'tipoCc',
  ].includes(filtro)
}