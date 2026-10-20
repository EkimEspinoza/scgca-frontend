-- Auditoría de rendimiento: índices de soporte para claves foráneas.
-- No cambia las reglas de acceso ni los datos; facilita joins y operaciones
-- de actualización/eliminación en tablas referenciadas.
BEGIN;

CREATE INDEX IF NOT EXISTS idx_dim_campana_cod_cc_pk
  ON public."Dim_Campana" (cod_cc_pk);

CREATE INDEX IF NOT EXISTS idx_usuarios_id_permiso
  ON public.usuarios (id_permiso);

COMMIT;
