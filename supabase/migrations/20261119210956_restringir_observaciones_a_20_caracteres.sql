begin;

alter table public.mov_mo
  add constraint mov_mo_obs_max_20_check
  check (obs is null or char_length(obs) <= 20);

alter table public.mov_mo_proceso
  add constraint mov_mo_proceso_obs_max_20_check
  check (obs is null or char_length(obs) <= 20);

alter table public.mov_mo_pendiente
  add constraint mov_mo_pendiente_obs_max_20_check
  check (obs is null or char_length(obs) <= 20);

alter table public.mov_tareo
  add constraint mov_tareo_observacion_max_20_check
  check (observacion is null or char_length(observacion) <= 20);

alter table public.mov_tareo_proceso
  add constraint mov_tareo_proceso_observacion_max_20_check
  check (observacion is null or char_length(observacion) <= 20);

alter table public.mov_tareo_pendiente
  add constraint mov_tareo_pendiente_observacion_max_20_check
  check (observacion is null or char_length(observacion) <= 20);

commit;
