// Valida los campos requeridos para crear o editar un centro de costo.
import { TIPOS_CC } from './centroCostoRules'

export function validarDatosCentroCosto({ empresaId, codCc, descCc, tipoCcId, tipoMaqId, modoEdicion }) {
    const errores = {}
    if (!empresaId) errores.empresaId = 'Seleccione una empresa.'

    if (!modoEdicion) {
        const codigo = Number(codCc)
        if (!codCc) errores.codCc = 'Ingrese el código del Centro de Costo.'
        else if (!Number.isSafeInteger(codigo) || codigo < 0) {
            errores.codCc = 'Ingrese un código numérico entero mayor o igual a cero.'
        }
    }

    if (!descCc.trim()) errores.descCc = 'Ingrese la descripción del Centro de Costo.'
    if (!tipoCcId) errores.tipoCcId = 'Seleccione el Tipo de Centro de Costo.'
    if (Number(tipoCcId) === TIPOS_CC.MAQUINARIA && !tipoMaqId) {
        errores.tipoMaqId = 'Seleccione el Tipo de Maquinaria.'
    }
    return errores
}
