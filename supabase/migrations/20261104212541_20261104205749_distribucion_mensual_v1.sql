-- Primera etapa de Distribución: tabla de datos por empresa, centro y cierre mensual.
-- Las escrituras quedan cerradas hasta que se despliegue la RPC transaccional.

begin;

create table public."Dim_PorcentajeDist" (
    "id_Empresa_Dist" bigint not null,
    "COD_CC_Dist" bigint not null,
    "Cod_CC_PK_Dist" bigint not null,
    "PORCENTAJE" numeric(9, 4) not null,
    "FECHA" date not null,
    "Num_Hec" numeric(20, 8) not null,
    "Porcentaje_Hec" numeric(9, 4) not null,

    constraint "PK_Dim_PorcentajeDist"
        primary key ("id_Empresa_Dist", "Cod_CC_PK_Dist", "FECHA"),

    constraint "FK_Dim_PorcentajeDist_Empresa"
        foreign key ("id_Empresa_Dist")
        references public."Dim_Empresa" ("id_empresa")
        on update restrict on delete restrict,

    constraint "FK_Dim_PorcentajeDist_CentroCosto"
        foreign key ("Cod_CC_PK_Dist")
        references public.dim_centro_costo (cod_cc_pk)
        on update restrict on delete restrict,

    constraint "UQ_Dim_PorcentajeDist_CodigoLocal"
        unique ("id_Empresa_Dist", "COD_CC_Dist", "FECHA"),

    constraint "CK_Dim_PorcentajeDist_Porcentaje"
        check ("PORCENTAJE" between 0 and 1),

    constraint "CK_Dim_PorcentajeDist_PorcentajeHec"
        check ("Porcentaje_Hec" between 0 and 1),

    constraint "CK_Dim_PorcentajeDist_NumHec"
        check ("Num_Hec" >= 0),

    constraint "CK_Dim_PorcentajeDist_FechaFinMes"
        check (
            "FECHA" =
            (date_trunc('month', "FECHA")::date + interval '1 month' - interval '1 day')::date
        )
);

create index "IX_Dim_PorcentajeDist_Fecha"
    on public."Dim_PorcentajeDist" ("FECHA", "id_Empresa_Dist");

alter table public."Dim_PorcentajeDist" enable row level security;

revoke all on table public."Dim_PorcentajeDist" from public, anon, authenticated;
grant select on table public."Dim_PorcentajeDist" to authenticated;

create policy "Dim_PorcentajeDist_Consulta"
    on public."Dim_PorcentajeDist"
    for select
    to authenticated
    using (
        (select private.can_access_module('DISTRIBUCION', 'QUERY'))
        and (select private.has_company_access("id_Empresa_Dist"))
    );

commit;
