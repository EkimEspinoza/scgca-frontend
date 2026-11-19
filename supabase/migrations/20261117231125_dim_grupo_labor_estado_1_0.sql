begin;

alter table public."Dim_GrupoLabor"
  alter column estado drop default,
  alter column estado type smallint using case when estado then 1 else 0 end,
  alter column estado set default 1;

alter table public."Dim_GrupoLabor"
  add constraint dim_grupo_labor_estado_check check (estado in (0, 1));

comment on column public."Dim_GrupoLabor".estado is
  'Estado del registro: 1 activo, 0 inactivo.';

commit;
