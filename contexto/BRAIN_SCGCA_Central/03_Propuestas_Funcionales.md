# Propuestas funcionales futuras — SCGCA Central

**Actualizado:** 2026-11-05
Este registro acumula ideas y requisitos futuros. Estar aquí no significa que la propuesta esté aprobada ni que se haya iniciado. Cuando el usuario acuerde ejecutarla, mover su seguimiento al plan de trabajo y conservar aquí el origen y la decisión.

**Escala de estimación:** días/persona o intervalo de esfuerzo, definido después de analizar alcance, dependencias y criterios. Hasta entonces se indica “Por estimar”; no se inventan fechas ni duraciones.

| ID | Propuesta | Estado | Prioridad | Estimación | Dependencias / próximo paso |
|---|---|---|---|---|---|
| PF-001 | Permisos granulares por usuario y módulo | EN DESARROLLO (PILOTO) | En curso | Por estimar | Catálogo y asignaciones creados; RLS piloto de Empresas y niveles QUERY/WRITER validados por el usuario. Pantallas ADMIN de Módulos y Permisos implementadas localmente; falta validación manual, despliegue del frontend y decidir qué módulo de negocio recibirá después RLS granular. Eliminar solo ADMIN. |
| PF-002 | Módulo Almacén: artículos, clases y subclases | PROPUESTA | Por definir | Por estimar | Definir alcance, datos, pantallas, permisos e importación. |
| PF-003 | Importación Excel con validación de maestros | PROPUESTA | Por definir | Por estimar | Definir formato, vista previa, errores y reversión. |
| PF-004 | Distribución mensual | EN VALIDACIÓN | Aprobado por el usuario | Por estimar | Interfaz multimes y regla PORCENTAJE=0 implementadas; backend y migraciones aplicados en Supabase. Falta validación manual del flujo. No mostrar variedad ni filtrar por campaña. Importación y exportación Excel quedan registradas por separado como trabajo futuro. |
| PF-005 | Reportes, KPIs y Power BI | PROPUESTA | Por definir | Por estimar | Definir indicadores, filtros, exportaciones y fuentes. |
| PF-006 | Integraciones SCIRE y XRAY | FUTURA | Por definir | Por estimar | Identificar sistemas fuente, datos y sincronización. |
| PF-007 | Mostrar el cierre de la campaña anterior al crear una nueva | REGISTRADO | Por definir | Por estimar | Acordar comportamiento y validación esperados. |
| PF-008 | Automatizar la venta SUNAT del último día calendario del mes | PENDIENTE (API ESTABLE) | Por definir | Por estimar | Hasta encontrar y validar una API directa de SUNAT, el formulario propone 1.000 y el ADMIN ingresa manualmente el valor. No sustituir la fuente por BCRP. |
| PF-009 | Optimización de consultas y paginación de módulos | PROPUESTA | Por definir | Por estimar | Revisar módulos que descargan todos los registros y filtran/paginan en frontend; mover filtros, orden y paginación a Supabase, evaluar índices según consultas reales y definir una estrategia separada para exportaciones completas. |
| PF-010 | Interfaz ADMIN para gestionar asignaciones de módulos y niveles QUERY/WRITER | IMPLEMENTADA EN GITHUB MAIN | Validar | Por estimar | Rutas `/modulos` y `/permisos` integradas mediante PR #63; build correcto el 2026-11-02. Falta validar los flujos manualmente y publicar el frontend en hosting. |
| PF-011 | Optimizar el bundle JavaScript inicial mediante división de código y carga diferida | PROPUESTA | Por definir | Por estimar | Build del 2026-11-03: bundle principal de 736.44 KB minificado (230.36 KB gzip). Evaluar división por rutas/módulos, priorizando lo que reduzca carga inicial; medir el resultado y el efecto en la navegación. El umbral de 500 KB de Vite es una advertencia, no un objetivo obligatorio. |
| PF-012 | Distribución: cargar porcentajes contables desde Excel | IMPLEMENTACIÓN FUTURA | Acordado por el usuario | Por estimar | Definir plantilla con centro de costo/mes y validar duplicados, centros no vigentes y suma de PORCENTAJE en 100 % por empresa/mes. Num_Hec y Porcentaje_Hec seguirán calculándose en el sistema. |
| PF-013 | Distribución: exportar la vista a Excel | IMPLEMENTACIÓN FUTURA | Acordado por el usuario | Por estimar | Exportar empresa y rango seleccionado con COD_CC_PK_Dist, descripción, hectáreas, PORCENTAJE, Porcentaje_Hec, totales y estado mensual. Considerar compatibilidad con la futura plantilla de carga. |
| PF-014 | Módulo Mov_Tareo: registrar horas de maquinaria por centro de costo | PRÓXIMO MÓDULO | Acordado por el usuario | Por estimar | Registrar horas trabajadas de maquinaria por centro de costo de inversión de Campo, Vivero y LEVANTE. Definir estructura, período, captura, validaciones y permisos al iniciar el diseño. |

## Plantilla para nuevas propuestas

- ID:
- Fecha y origen:
- Necesidad y usuario beneficiado:
- Descripción / resultado esperado:
- Módulo:
- Prioridad:
- Estimación y supuestos:
- Dependencias y riesgos:
- Criterios de aceptación:
- Estado: PROPUESTA, EN ANÁLISIS, APROBADA, DESCARTADA, EN DESARROLLO o IMPLEMENTADA.
- Decisión/evidencia:
- Siguiente paso:
