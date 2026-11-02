-- Alinea el acceso de la pantalla Empresas con los maestros ADMIN-only.
-- Conserva lectura por empresa asignada para consultas desde otros módulos.
-- Solo ADMIN puede crear, actualizar o eliminar empresas.

drop policy if exists empresas_query_ver_asignadas
    on public."Dim_Empresa";
drop policy if exists empresas_writer_crear
    on public."Dim_Empresa";
drop policy if exists empresas_writer_actualizar_asignadas
    on public."Dim_Empresa";

create policy usuario_ver_empresas_asignadas
    on public."Dim_Empresa" for select to authenticated
    using (
        (select private.get_my_permission()) is not null
        and exists (
            select 1
            from public.usuario_empresa ue
            join public.usuarios u on u.id_usuario = ue.id_usuario
            where ue.id_empresa = "Dim_Empresa".id_empresa
              and ue.estado is true
              and u.auth_user_id = (select auth.uid())
              and u.estado::text = 'ACTIVO'
        )
    );
