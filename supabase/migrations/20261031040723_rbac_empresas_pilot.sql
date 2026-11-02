-- Piloto RLS por módulo para Empresas. Los roles globales antiguos QUERY y
-- READER se conservan, pero dejan de dar acceso a esta tabla sin asignación.

create or replace function private.can_access_module(
    p_codigo text,
    p_min_level text default 'QUERY'
)
returns boolean
language sql
stable
security definer
set search_path to 'pg_catalog', 'public', 'private', 'pg_temp'
as $function$
    select case
        when (select auth.uid()) is null then false
        when (select private.is_admin()) then true
        when p_min_level not in ('QUERY', 'READER') then false
        else exists (
            select 1
            from public.usuarios u
            join public.permiso p on p.id_permiso = u.id_permiso
            join public.usuario_modulo um on um.id_usuario = u.id_usuario
            join public.modulos m on m.id_modulo = um.id_modulo
            where u.auth_user_id = (select auth.uid())
              and u.estado = 'ACTIVO'
              and p.estado is true
              and p.nombre in ('QUERY', 'READER')
              and um.estado is true
              and m.estado is true
              and m.codigo = p_codigo
              and (um.nivel = 'READER' or p_min_level = 'QUERY')
        )
    end;
$function$;

create or replace function private.has_company_access(p_id_empresa bigint)
returns boolean
language sql
stable
security definer
set search_path to 'pg_catalog', 'public', 'private', 'pg_temp'
as $function$
    select case
        when (select auth.uid()) is null then false
        when (select private.is_admin()) then true
        else exists (
            select 1
            from public.usuarios u
            join public.usuario_empresa ue on ue.id_usuario = u.id_usuario
            where u.auth_user_id = (select auth.uid())
              and u.estado = 'ACTIVO'
              and ue.id_empresa = p_id_empresa
              and ue.estado is true
        )
    end;
$function$;

revoke all on function private.can_access_module(text, text) from public, anon, authenticated;
grant execute on function private.can_access_module(text, text) to authenticated;
revoke all on function private.has_company_access(bigint) from public, anon, authenticated;
grant execute on function private.has_company_access(bigint) to authenticated;

drop policy if exists usuario_ver_empresas_asignadas on public."Dim_Empresa";

create policy empresas_query_ver_asignadas
    on public."Dim_Empresa" for select to authenticated
    using (
        (select private.can_access_module('EMPRESAS', 'QUERY'))
        and (select private.has_company_access(id_empresa))
    );

-- Reader puede crear en el módulo; como Empresa es la entidad raíz del alcance,
-- el control de filas asignadas aplica a lectura/actualización existentes.
create policy empresas_reader_crear
    on public."Dim_Empresa" for insert to authenticated
    with check ((select private.can_access_module('EMPRESAS', 'READER')));

create policy empresas_reader_actualizar_asignadas
    on public."Dim_Empresa" for update to authenticated
    using (
        (select private.can_access_module('EMPRESAS', 'READER'))
        and (select private.has_company_access(id_empresa))
    )
    with check (
        (select private.can_access_module('EMPRESAS', 'READER'))
        and (select private.has_company_access(id_empresa))
    );
