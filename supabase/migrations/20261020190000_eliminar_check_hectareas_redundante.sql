-- Higiene del esquema: elimina una restricción redundante.
-- dim_campana_hectareas_positivas ya exige hectareas IS NOT NULL AND hectareas > 0,
-- por lo que también implica la condición antigua hectareas >= 0.
-- No aplicar manualmente en producción; desplegar mediante el flujo habitual de migraciones.
ALTER TABLE public."Dim_Campana"
    DROP CONSTRAINT IF EXISTS chk_campaña_hectareas;
