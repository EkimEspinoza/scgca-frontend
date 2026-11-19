begin;

-- La observación de mov_tareo será el registro temporal de cambios.
drop trigger if exists mov_tareo_audit_update on public.mov_tareo;

commit;
