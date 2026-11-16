begin;

-- ADMIN puede actualizar globalmente; el resto requiere asignación activa a la empresa.
drop policy if exists mov_tareo_update_writer on public.mov_tareo;
create policy mov_tareo_update_writer
on public.mov_tareo
for update to authenticated
using (
    (select private.is_admin())
    or (
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
)
with check (
    (select private.is_admin())
    or (
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
);

drop policy if exists mov_tareo_pendiente_update_writer on public.mov_tareo_pendiente;
create policy mov_tareo_pendiente_update_writer
on public.mov_tareo_pendiente
for update to authenticated
using (
    (select private.is_admin())
    or (
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
)
with check (
    (select private.is_admin())
    or (
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
);

commit;
