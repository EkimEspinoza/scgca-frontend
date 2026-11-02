-- Piloto de permisos por módulo para Variedades.
-- Query consulta y exporta; Writer consulta y administra sin eliminar.
-- El borrado sigue reservado a ADMIN.

drop policy if exists usuarios_activos_ver_variedad
    on public.dim_variedad;
drop policy if exists admin_crear_variedad
    on public.dim_variedad;
drop policy if exists admin_modificar_variedad
    on public.dim_variedad;
drop policy if exists admin_eliminar_variedad
    on public.dim_variedad;
drop policy if exists variedades_query_ver
    on public.dim_variedad;
drop policy if exists variedades_writer_crear
    on public.dim_variedad;
drop policy if exists variedades_writer_actualizar
    on public.dim_variedad;
drop policy if exists variedades_admin_eliminar
    on public.dim_variedad;

create policy variedades_query_ver
    on public.dim_variedad for select to authenticated
    using (
        exists (
            select 1 from public.modulos m
            where m.codigo = 'VARIEDADES' and m.estado is true
        )
        and (select private.can_access_module('VARIEDADES', 'QUERY'))
    );

create policy variedades_writer_crear
    on public.dim_variedad for insert to authenticated
    with check (
        exists (
            select 1 from public.modulos m
            where m.codigo = 'VARIEDADES' and m.estado is true
        )
        and (select private.can_access_module('VARIEDADES', 'WRITER'))
    );

create policy variedades_writer_actualizar
    on public.dim_variedad for update to authenticated
    using (
        exists (
            select 1 from public.modulos m
            where m.codigo = 'VARIEDADES' and m.estado is true
        )
        and (select private.can_access_module('VARIEDADES', 'WRITER'))
    )
    with check (
        exists (
            select 1 from public.modulos m
            where m.codigo = 'VARIEDADES' and m.estado is true
        )
        and (select private.can_access_module('VARIEDADES', 'WRITER'))
    );

create policy variedades_admin_eliminar
    on public.dim_variedad for delete to authenticated
    using (
        exists (
            select 1 from public.modulos m
            where m.codigo = 'VARIEDADES' and m.estado is true
        )
        and (select private.is_admin())
    );
