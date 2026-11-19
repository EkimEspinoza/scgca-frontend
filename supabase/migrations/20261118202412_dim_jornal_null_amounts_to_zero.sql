begin;

update public."Dim_Jornal"
set "Importe_Soles" = 0
where "Importe_Soles" is null;

alter table public."Dim_Jornal"
  alter column "Importe_Soles" set not null;

comment on column public."Dim_Jornal"."Importe_Soles" is
  'Importe del jornal en soles; 0 representa que no hay importe registrado para el periodo.';

commit;
