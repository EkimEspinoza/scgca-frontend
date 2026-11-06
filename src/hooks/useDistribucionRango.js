import { useCallback, useEffect, useState } from 'react'
import {
  guardarDistribucionMes,
  obtenerEstadoDistribucionMes,
  previsualizarDistribucionMes,
  reabrirDistribucionMes,
} from '../services/distribucionService'
import { calcularPorcentajesHectareas, fechaFinDeMes } from '../components/distribucion/distribucionRules'

function mesesEntre(desde, hasta) {
  if (!desde || !hasta || desde > hasta) return []
  if (desde < '2017-01' || hasta < '2017-01') {
    throw new Error('El rango de distribución debe comenzar en enero de 2017 o después.')
  }
  const [anioInicial, mesInicial] = desde.split('-').map(Number)
  const [anioFinal, mesFinal] = hasta.split('-').map(Number)
  const cantidad = (anioFinal - anioInicial) * 12 + mesFinal - mesInicial + 1
  if (cantidad > 3) throw new Error('Selecciona un rango máximo de 3 meses para editar la distribución.')
  return Array.from({ length: cantidad }, (_, indice) => {
    const fecha = new Date(Date.UTC(anioInicial, mesInicial - 1 + indice, 1))
    const mes = `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`
    return { mes, fecha: fechaFinDeMes(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1) }
  })
}

export function useDistribucionRango(idEmpresa, desde, hasta) {
  const [periodos, setPeriodos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargar = useCallback(async () => {
    if (!idEmpresa || !desde || !hasta || desde > hasta) {
      setPeriodos([])
      return
    }
    setCargando(true)
    setError('')
    setMensaje('')
    try {
      const meses = mesesEntre(desde, hasta)
      const resultados = await Promise.all(meses.map(async (periodo) => {
        const [filas, estado] = await Promise.all([
          previsualizarDistribucionMes(idEmpresa, periodo.fecha),
          obtenerEstadoDistribucionMes(idEmpresa, periodo.fecha),
        ])
        return {
          ...periodo,
          estado,
          filas: (filas ?? []).map((fila) => ({
            ...fila,
            porcentaje: fila.porcentaje === null ? '' : String(fila.porcentaje),
            porcentaje_text: fila.porcentaje === null ? '' : (Number(fila.porcentaje) * 100).toFixed(4),
          })),
        }
      }))
      setPeriodos(resultados)
    } catch (err) {
      console.error('Error cargando el rango de distribución:', err)
      setError(err?.message || 'No se pudo cargar el rango de distribución.')
      setPeriodos([])
    } finally {
      setCargando(false)
    }
  }, [idEmpresa, desde, hasta])

  useEffect(() => { void cargar() }, [cargar])

  const cambiarPorcentaje = useCallback((mes, codCcPk, valorPorcentaje) => {
    setError('')
    setMensaje('')
    setPeriodos((actuales) => actuales.map((periodo) => {
      if (periodo.mes !== mes) return periodo
      const filasActualizadas = periodo.filas.map((fila) => Number(fila.cod_cc_pk_dist) !== Number(codCcPk)
        ? fila
        : {
            ...fila,
            porcentaje_text: valorPorcentaje,
            porcentaje: valorPorcentaje.trim() === ''
              ? ''
              : String(Number(valorPorcentaje.replace(',', '.')) / 100),
          })
      return { ...periodo, filas: calcularPorcentajesHectareas(filasActualizadas) }
    }))
  }, [])

  const guardar = useCallback(async (mesesParaGuardar, cerrarMes = null) => {
    const seleccionados = periodos.filter((periodo) => mesesParaGuardar.includes(periodo.mes))
    setGuardando(true)
    setError('')
    setMensaje('')
    let mesEnProceso = ''
    try {
      for (const periodo of seleccionados) {
        mesEnProceso = periodo.mes
        await guardarDistribucionMes(idEmpresa, periodo.fecha, periodo.filas, periodo.mes === cerrarMes)
      }
      await cargar()
      setMensaje(cerrarMes
        ? `Se guardaron y cerraron los datos de ${cerrarMes}.`
        : `Se guardaron ${seleccionados.length} ${seleccionados.length === 1 ? 'mes' : 'meses'} como borrador.`)
      return true
    } catch (err) {
      console.error('Error guardando la distribución por rango:', err)
      await cargar()
      setError(`No se pudo guardar ${mesEnProceso || 'el rango'}: ${err?.message || 'error inesperado'}. Si se guardaban varios meses, los anteriores pueden haberse guardado correctamente.`)
      return false
    } finally {
      setGuardando(false)
    }
  }, [periodos, idEmpresa, cargar])

  const reabrir = useCallback(async (mes) => {
    const periodo = periodos.find((item) => item.mes === mes)
    if (!periodo) return false
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      const cantidad = await reabrirDistribucionMes(idEmpresa, periodo.fecha)
      await cargar()
      setMensaje(cantidad > 1
        ? `Se reabrió ${mes} y los meses posteriores de la empresa.`
        : `Se reabrió ${mes}.`)
      return true
    } catch (err) {
      setError(err?.message || `No se pudo reabrir ${mes}.`)
      return false
    } finally {
      setGuardando(false)
    }
  }, [periodos, idEmpresa, cargar])

  return { periodos, cargando, guardando, error, mensaje, cambiarPorcentaje, guardar, reabrir }
}

export { mesesEntre }
