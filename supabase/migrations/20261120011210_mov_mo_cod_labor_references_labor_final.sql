begin;

alter table public.mov_mo
  drop constraint mov_mo_cod_labor_fkey;

alter table public.mov_mo
  add constraint mov_mo_cod_labor_fkey
  foreign key (cod_labor)
  references public."Dim_Labor_Final" ("Id_Lab_Fin");

commit;
