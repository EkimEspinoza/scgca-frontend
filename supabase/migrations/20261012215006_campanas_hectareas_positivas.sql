-- Migración registrada en Supabase como 20261012215006 / campanas_hectareas_positivas.
-- El constraint ya existe en producción; no volver a ejecutar manualmente allí.
ALTER TABLE public."Dim_Campana"
    ADD CONSTRAINT dim_campana_hectareas_positivas
    CHECK (hectareas IS NOT NULL AND hectareas > 0);
