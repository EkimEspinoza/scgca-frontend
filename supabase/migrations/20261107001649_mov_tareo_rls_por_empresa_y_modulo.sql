begin;

alter sequence public.mov_tareo_id_mov_tareo_seq
    rename to mov_tareo_pendiente_id_mov_tareo_seq;
alter sequence public.mov_tareo_id_mov_tareo_seq1
    rename to mov_tareo_id_mov_tareo_seq;

insert into public.modulos (codigo, nombre, grupo, ruta, orden, estado)
values ('MOV_TAREO', 'Mov. Tareo', 'Procesos', '/mov-tareo', 130, true)
on conflict (codigo) do nothing;

revoke all on table public.mov_tareo, public.mov_tareo_pendiente from anon, public;
grant select, insert, update, delete
    on table public.mov_tareo, public.mov_tareo_pendiente to authenticated;
grant usage, select
    on sequence public.mov_tareo_id_mov_tareo_seq,
                public.mov_tareo_pendiente_id_mov_tareo_seq
    to authenticated;

create policy mov_tareo_select_autorizado
on public.mov_tareo
for select to authenticated
using (
    (select private.is_admin())
    or (
        (select private.can_access_module('MOV_TAREO', 'QUERY'))
        and exists (
            select 1
            from public.usuario_empresa ue
            join public.usuarios u on u.id_usuario = ue.id_usuario
            where ue.id_empresa = mov_tareo.id_empresa
              and ue.estado is true
              and u.auth_user_id = (select auth.uid())
              and u.estado::text = 'ACTIVO'
        )
    )
);

create policy mov_tareo_insert_writer
on public.mov_tareo
for insert to authenticated
with check (
    (select private.can_access_module('MOV_TAREO', 'WRITER'))
    and exists (
        select 1
        from public.usuario_empresa ue
        join public.usuarios u on u.id_usuario = ue.id_usuario
        where ue.id_empresa = mov_tareo.id_empresa
          and ue.estado is true
          and u.auth_user_id = (select auth.uid())
          and u.estado::text = 'ACTIVO'
    )
);

create policy mov_tareo_update_writer
on public.mov_tareo
for update to authenticated
using (
    (select private.can_access_module('MOV_TAREO', 'WRITER'))
    and exists (
        select 1
        from public.usuario_empresa ue
        join public.usuarios u on u.id_usuario = ue.id_usuario
        where ue.id_empresa = mov_tareo.id_empresa
          and ue.estado is true
          and u.auth_user_id = (select auth.uid())
          and u.estado::text = 'ACTIVO'
    )
)
with check (
    (select private.can_access_module('MOV_TAREO', 'WRITER'))
    and exists (
        select 1
        from public.usuario_empresa ue
        join public.usuarios u on u.id_usuario = ue.id_usuario
        where ue.id_empresa = mov_tareo.id_empresa
          and ue.estado is true
          and u.auth_user_id = (select auth.uid())
          and u.estado::text = 'ACTIVO'
    )
);

create policy mov_tareo_delete_admin
on public.mov_tareo
for delete to authenticated
using ((select private.is_admin()));

create policy mov_tareo_pendiente_select_autorizado
on public.mov_tareo_pendiente
for select to authenticated
using (
    (select private.is_admin())
    or (
        (select private.can_access_module('MOV_TAREO', 'QUERY'))
        and exists (
            select 1
            from public.usuario_empresa ue
            join public.usuarios u on u.id_usuario = ue.id_usuario
            where ue.id_empresa = mov_tareo_pendiente.id_empresa
              and ue.estado is true
              and u.auth_user_id = (select auth.uid())
              and u.estado::text = 'ACTIVO'
        )
    )
);

create policy mov_tareo_pendiente_insert_writer
on public.mov_tareo_pendiente
for insert to authenticated
with check (
    (select private.can_access_module('MOV_TAREO', 'WRITER'))
    and exists (
        select 1
        from public.usuario_empresa ue
        join public.usuarios u on u.id_usuario = ue.id_usuario
        where ue.id_empresa = mov_tareo_pendiente.id_empresa
          and ue.estado is true
          and u.auth_user_id = (select auth.uid())
          and u.estado::text = 'ACTIVO'
    )
);

create policy mov_tareo_pendiente_update_writer
on public.mov_tareo_pendiente
for update to authenticated
using (
    (select private.can_access_module('MOV_TAREO', 'WRITER'))
    and exists (
        select 1
        from public.usuario_empresa ue
        join public.usuarios u on u.id_usuario = ue.id_usuario
        where ue.id_empresa = mov_tareo_pendiente.id_empresa
          and ue.estado is true
          and u.auth_user_id = (select auth.uid())
          and u.estado::text = 'ACTIVO'
    )
)
with check (
    (select private.can_access_module('MOV_TAREO', 'WRITER'))
    and exists (
        select 1
        from public.usuario_empresa ue
        join public.usuarios u on u.id_usuario = ue.id_usuario
        where ue.id_empresa = mov_tareo_pendiente.id_empresa
          and ue.estado is true
          and u.auth_user_id = (select auth.uid())
          and u.estado::text = 'ACTIVO'
    )
);

create policy mov_tareo_pendiente_delete_admin
on public.mov_tareo_pendiente
for delete to authenticated
using ((select private.is_admin()));

commit;
