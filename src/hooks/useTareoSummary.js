// Carga los contadores por estado y el resumen mensual de Tareo.
import { useCallback, useEffect, useState } from 'react'
import { contarMovimientosTareo, obtenerResumenMensualTareo } from '../services/tareoService'

export function useTareoSummary({ pestana, idEmpresa, fechaDesde, fechaHasta, setError }) {
    const [resumen, setResumen] = useState({ registros: 0, enProceso: 0, pendientes: 0 })
    const [filasResumen, setFilasResumen] = useState([])
    const [cargandoResumen, setCargandoResumen] = useState(false)

    useEffect(() => {
        let vigente = true
        contarMovimientosTareo(idEmpresa, fechaDesde, fechaHasta)
            .then((data) => { if (vigente) setResumen(data) })
            .catch((err) => {
                console.error('Error cargando los totales de Tareo:', err)
                if (vigente) setError(err?.message || 'No se pudieron cargar los totales de Tareo.')
            })
        return () => { vigente = false }
    }, [idEmpresa, fechaDesde, fechaHasta, setError])

    const cargarResumenMensual = useCallback(async () => {
        if (pestana !== 3) return
        if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
            setFilasResumen([])
            setCargandoResumen(false)
            return
        }
        setCargandoResumen(true)
        setError('')
        try {
            setFilasResumen(await obtenerResumenMensualTareo({ idEmpresa, fechaDesde, fechaHasta }))
        } catch (err) {
            console.error('Error cargando el resumen mensual de Tareo:', err)
            setError(err?.message || 'No se pudo cargar el resumen mensual de Tareo.')
            setFilasResumen([])
        } finally {
            setCargandoResumen(false)
        }
    }, [pestana, idEmpresa, fechaDesde, fechaHasta, setError])

    useEffect(() => { void cargarResumenMensual() }, [cargarResumenMensual])

    return { resumen, setResumen, filasResumen, cargandoResumen, cargarResumenMensual }
}
