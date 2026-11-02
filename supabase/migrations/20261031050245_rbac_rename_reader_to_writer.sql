-- Renombra READER como WRITER conservando las asignaciones y sus privilegios.

alter table public.usuario_modulo
    drop constraint usuario_modulo_nivel_check;

update public.usuario_modulo
set nivel = 'WRITER',
    updated_at = now()
where nivel = 'READER';

alter table public.usuario_modulo
    add constraint usuario_modulo_nivel_check
    check (nivel in ('QUERY', 'WRITER'));

update public.permiso
set nombre = 'WRITER'
where nombre = 'READER';

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
        when p_min_level not in ('QUERY', 'WRITER') then false
        else exists (
            select 1
            from public.usuarios u
            join public.permiso p on p.id_permiso = u.id_permiso
            join public.usuario_modulo um on um.id_usuario = u.id_usuario
            join public.modulos m on m.id_modulo = um.id_modulo
            where u.auth_user_id = (select auth.uid())
              and u.estado = 'ACTIVO'
              and p.estado is true
              and p.nombre in ('QUERY', 'WRITER')
              and um.estado is true
              and m.estado is true
              and m.codigo = p_codigo
              and (um.nivel = 'WRITER' or p_min_level = 'QUERY')
        )
    end;
$function$;

drop policy if exists empresas_reader_crear on public."Dim_Empresa";
drop policy if exists empresas_reader_actualizar_asignadas on public."Dim_Empresa";

create policy empresas_writer_crear
    on public."Dim_Empresa" for insert to authenticated
    with check ((select private.can_access_module('EMPRESAS', 'WRITER')));

create policy empresas_writer_actualizar_asignadas
    on public."Dim_Empresa" for update to authenticated
    using (
        (select private.can_access_module('EMPRESAS', 'WRITER'))
        and (select private.has_company_access(id_empresa))
    )
    with check (
        (select private.can_access_module('EMPRESAS', 'WRITER'))
        and (select private.has_company_access(id_empresa))
    );
