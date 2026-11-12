begin;
alter table public.mov_tareo
    alter column etapa_tareo type text using etapa_tareo::text;
alter table public.mov_tareo_pendiente
    alter column etapa_tareo type text using etapa_tareo::text,
    drop column aplicado_at;
comment on column public.mov_tareo.etapa_tareo is
    'Valor original ETAPA_TAREO del archivo fuente, conservado como texto para no restringir el catálogo antes de confirmarlo.';
comment on column public.mov_tareo_pendiente.etapa_tareo is
    'Valor original ETAPA_TAREO del archivo fuente, conservado como texto para no restringir el catálogo antes de confirmarlo.';
commit;
