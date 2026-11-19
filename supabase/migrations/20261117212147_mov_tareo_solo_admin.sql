begin;

-- Mov_Tareo, pendiente, proceso e historial quedan disponibles solo para ADMIN.
drop policy if exists mov_tareo_select_autorizado on public.mov_tareo;
create policy mov_tareo_select_admin
on public.mov_tareo for select to authenticated
using ((select private.is_admin()));

drop policy if exists mov_tareo_insert_writer on public.mov_tareo;
create policy mov_tareo_insert_admin
on public.mov_tareo for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists mov_tareo_update_writer on public.mov_tareo;
create policy mov_tareo_update_admin
on public.mov_tareo for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists mov_tareo_proceso_select_autorizado on public.mov_tareo_proceso;
create policy mov_tareo_proceso_select_admin
on public.mov_tareo_proceso for select to authenticated
using ((select private.is_admin()));

drop policy if exists mov_tareo_pendiente_select_autorizado on public.mov_tareo_pendiente;
create policy mov_tareo_pendiente_select_admin
on public.mov_tareo_pendiente for select to authenticated
using ((select private.is_admin()));

drop policy if exists mov_tareo_pendiente_insert_writer on public.mov_tareo_pendiente;
create policy mov_tareo_pendiente_insert_admin
on public.mov_tareo_pendiente for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists mov_tareo_pendiente_update_writer on public.mov_tareo_pendiente;
create policy mov_tareo_pendiente_update_admin
on public.mov_tareo_pendiente for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists mov_tareo_historial_select_autorizado on public.mov_tareo_historial;
create policy mov_tareo_historial_select_admin
on public.mov_tareo_historial for select to authenticated
using ((select private.is_admin()));

commit;
