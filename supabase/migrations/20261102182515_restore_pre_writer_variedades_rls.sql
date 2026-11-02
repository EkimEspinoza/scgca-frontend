-- Restaura las políticas de Variedades previas al piloto QUERY/WRITER.
-- Cualquier permiso global activo puede consultar; solo ADMIN escribe.

drop policy if exists variedades_query_ver
    on public.dim_variedad;
drop policy if exists variedades_writer_crear
    on public.dim_variedad;
drop policy if exists variedades_writer_actualizar
    on public.dim_variedad;
drop policy if exists variedades_admin_eliminar
    on public.dim_variedad;

create policy usuarios_activos_ver_variedad
    on public.dim_variedad for select to authenticated
    using (private.get_my_permission() is not null);

create policy admin_crear_variedad
    on public.dim_variedad for insert to authenticated
    with check (private.is_admin());

create policy admin_modificar_variedad
    on public.dim_variedad for update to authenticated
    using (private.is_admin())
    with check (private.is_admin());

create policy admin_eliminar_variedad
    on public.dim_variedad for delete to authenticated
    using (private.is_admin());
