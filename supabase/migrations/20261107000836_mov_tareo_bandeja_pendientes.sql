begin;

alter table public.mov_tareo_importacion rename to mov_tareo_pendiente;
alter table public.mov_tareo_pendiente
    rename constraint mov_tareo_importacion_pkey to mov_tareo_pendiente_pkey;
alter table public.mov_tareo_pendiente
    rename constraint mov_tareo_importacion_nro_parte_key to mov_tareo_pendiente_nro_parte_key;
alter index public.mov_tareo_importacion_empresa_fecha_idx
    rename to mov_tareo_pendiente_empresa_fecha_idx;
alter index public.mov_tareo_importacion_centro_fecha_idx
    rename to mov_tareo_pendiente_centro_fecha_idx;
alter index public.mov_tareo_importacion_maquinaria_fecha_idx
    rename to mov_tareo_pendiente_maquinaria_fecha_idx;

comment on table public.mov_tareo_pendiente is
    'Filas de tareo importadas que requieren corregir observaciones antes de promoverse a mov_tareo.';
comment on column public.mov_tareo_pendiente.nro_parte is
    'Identificador fuente estable para relacionar recargas y evitar duplicados entre pendientes y registros aceptados.';

commit;
