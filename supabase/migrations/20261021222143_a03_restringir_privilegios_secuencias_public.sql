-- A-03: restringir privilegios directos sobre secuencias del esquema public.
-- Se revocan todos los privilegios de anon y UPDATE de authenticated.
-- Se conservan USAGE/SELECT para que los INSERT autorizados puedan utilizar
-- secuencias identity/serial sin permitir manipulación directa con setval().
-- La migración fue aplicada en el proyecto Central mediante Supabase.
BEGIN;

REVOKE ALL PRIVILEGES ON SEQUENCE
  public."Dim_Etapa_Costo_cod_etapa_seq",
  public."Dim_TipoCC_id_tip_cc_seq",
  public."TipoCambio_id_tipo_cambio_seq",
  public."dim_comparativo_id_comparativo_seq",
  public."dim_tipo_maq_id_tipo_maq_seq",
  public."dim_variedad_id_variedad_seq",
  public."empresa_id_empresa_seq",
  public."permiso_id_permiso_seq",
  public."usuario_empresa_id_usuario_empresa_seq",
  public."usuarios_id_usuario_seq"
FROM anon;

REVOKE UPDATE ON SEQUENCE
  public."Dim_Etapa_Costo_cod_etapa_seq",
  public."Dim_TipoCC_id_tip_cc_seq",
  public."TipoCambio_id_tipo_cambio_seq",
  public."dim_comparativo_id_comparativo_seq",
  public."dim_tipo_maq_id_tipo_maq_seq",
  public."dim_variedad_id_variedad_seq",
  public."empresa_id_empresa_seq",
  public."permiso_id_permiso_seq",
  public."usuario_empresa_id_usuario_empresa_seq",
  public."usuarios_id_usuario_seq"
FROM authenticated;

COMMIT;
