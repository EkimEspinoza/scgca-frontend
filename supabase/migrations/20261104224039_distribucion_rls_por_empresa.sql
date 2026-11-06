begin;

drop policy if exists distribucion_mes_consulta on public.distribucion_mes;
drop policy if exists distribucion_evento_admin_consulta on public.distribucion_evento;

create policy distribucion_mes_admin_consulta
    on public.distribucion_mes for select to authenticated
    using (private.is_admin());

create policy distribucion_mes_empresa_consulta
    on public.distribucion_mes for select to authenticated
    using (
        private.get_my_permission() is not null
        and exists (
            select 1
            from public.usuario_empresa ue
            join public.usuarios u on u.id_usuario = ue.id_usuario
            where ue.id_empresa = distribucion_mes.id_empresa
              and ue.estado is true
              and u.auth_user_id = (select auth.uid())
              and u.estado::text = 'ACTIVO'
        )
    );

create policy distribucion_evento_admin_consulta
    on public.distribucion_evento for select to authenticated
    using (private.is_admin());

create policy distribucion_evento_empresa_consulta
    on public.distribucion_evento for select to authenticated
    using (
        private.get_my_permission() is not null
        and exists (
            select 1
            from public.usuario_empresa ue
            join public.usuarios u on u.id_usuario = ue.id_usuario
            where ue.id_empresa = distribucion_evento.id_empresa
              and ue.estado is true
              and u.auth_user_id = (select auth.uid())
              and u.estado::text = 'ACTIVO'
        )
    );

commit;