import { useCallback, useEffect, useState } from 'react'
import {
  guardarDistribucionMes,
  obtenerEstadoDistribucionMes,
  previsualizarDistribucionMes,
  reabrirDistribucionMes,
} from '../services/distribucionService'

export function useDistribucion(idEmpresa, fecha) {
  const [filas, setFilas] = useState([])
  const [estadoMes, setEstadoMes] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargar = useCallback(async () => {
    if (!idEmpresa || !fecha) {
      setFilas([])
      setEstadoMes(null)
      return
    }

    setCargando(true)
    setError('')
    setMensaje('')
    try {
      const [detalle, estado] = await Promise.all([
        previsualizarDistribucionMes(idEmpresa, fecha),
        obtenerEstadoDistribucionMes(idEmpresa, fecha),
      ])
      setFilas((detalle ?? []).map((fila) => ({
        ...fila,
        porcentaje: fila.porcentaje === null ? '' : String(fila.porcentaje),
      })))
      setEstadoMes(estado)
    } catch (err) {
      console.error('Error cargando la distribución mensual:', err)
      setError(err?.message || 'No se pudo cargar la distribución mensual.')
      setFilas([])
      setEstadoMes(null)
    } finally {
      setCargando(false)
    }
  }, [idEmpresa, fecha])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const cambiarPorcentaje = useCallback((codCcPk, valor) => {
    setError('')
    setMensaje('')
    setFilas((actuales) => actuales.map((fila) =>
      Number(fila.cod_cc_pk_dist) === Number(codCcPk)
        ? { ...fila, porcentaje: valor }
        : fila,
    ))
  }, [])

  const guardar = useCallback(async (cerrar = false) => {
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      await guardarDistribucionMes(idEmpresa, fecha, filas, cerrar)
      await cargar()
      setMensaje(cerrar ? 'Distribución guardada y mes cerrado.' : 'Borrador de distribución guardado.')
      return true
    } catch (err) {
      console.error('Error guardando la distribución mensual:', err)
      setError(err?.message || 'No se pudo guardar la distribución.')
      return false
    } finally {
      setGuardando(false)
    }
  }, [idEmpresa, fecha, filas, cargar])

  const reabrir = useCallback(async () => {
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      const cantidad = await reabrirDistribucionMes(idEmpresa, fecha)
      await cargar()
      setMensaje(cantidad > 1
        ? 'Se reabrió este mes y los meses posteriores de la empresa.'
        : 'Se reabrió el mes de la empresa.')
      return true
    } catch (err) {
      console.error('Error reabriendo la distribución mensual:', err)
      setError(err?.message || 'No se pudo reabrir la distribución.')
      return false
    } finally {
      setGuardando(false)
    }
  }, [idEmpresa, fecha, cargar])

  return {
    filas,
    estadoMes,
    cargando,
    guardando,
    error,
    mensaje,
    cambiarPorcentaje,
    guardar,
    reabrir,
    recargar: cargar,
    setMensaje,
  }
}
