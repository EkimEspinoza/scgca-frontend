drop policy if exists "Dim_PorcentajeDist_Consulta" on public."Dim_PorcentajeDist";

create policy "admin_ver_todos_porcentajes_dist"
on public."Dim_PorcentajeDist"
for select to authenticated
using (private.is_admin());

create policy "usuario_ver_porcentajes_dist_empresa"
on public."Dim_PorcentajeDist"
for select to authenticated
using (
  private.get_my_permission() is not null
  and exists (
    select 1
    from public.usuario_empresa ue
    join public.usuarios u on u.id_usuario = ue.id_usuario
    where ue.id_empresa = "Dim_PorcentajeDist"."id_Empresa_Dist"
      and ue.estado is true
      and u.auth_user_id = (select auth.uid())
      and u.estado::text = 'ACTIVO'
  )
);

create policy "admin_crear_porcentajes_dist"
on public."Dim_PorcentajeDist"
for insert to authenticated
with check (private.is_admin());

create policy "admin_modificar_porcentajes_dist"
on public."Dim_PorcentajeDist"
for update to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "admin_eliminar_porcentajes_dist"
on public."Dim_PorcentajeDist"
for delete to authenticated
using (private.is_admin());

grant select, insert, update, delete on public."Dim_PorcentajeDist" to authenticated;
