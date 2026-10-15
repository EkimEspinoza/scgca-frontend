-- Todas las campañas, históricas y futuras, deben tener hectáreas mayores que cero.
-- La consulta previa confirmó que no existen registros con hectáreas NULL o <= 0.

ALTER TABLE public."Dim_Campana"
    ADD CONSTRAINT dim_campana_hectareas_positivas
    CHECK (hectareas IS NOT NULL AND hectareas > 0);
