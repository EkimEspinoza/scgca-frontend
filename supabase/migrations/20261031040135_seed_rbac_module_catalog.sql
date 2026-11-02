-- Carga del catálogo inicial aprobado y las dos asignaciones de prueba acordadas.
-- No cambia tablas ni políticas de negocio.

insert into public.modulos (codigo, nombre, grupo, ruta, orden)
values
    ('DASHBOARD', 'Dashboard', 'Principal', '/dashboard', 10),
    ('USUARIOS', 'Usuarios', 'Administración', '/usuarios', 20),
    ('EMPRESAS', 'Empresas', 'Maestros', '/empresas', 30),
    ('VARIEDADES', 'Variedades', 'Maestros', '/variedades', 40),
    ('TIPOS_CENTRO_COSTO', 'Tipos de Centro de Costo', 'Maestros', '/tipos-centro-costo', 50),
    ('TIPOS_MAQUINARIA', 'Tipos de Maquinaria', 'Maestros', '/tipos-maquinaria', 60),
    ('ETAPAS_COSTO', 'Etapa de Costo Inversión', 'Maestros', '/etapa-costo', 70),
    ('TIPO_CAMBIO', 'Tipo Cambio', 'Maestros', '/tipo-cambio', 80),
    ('CAMPANAS', 'Campañas', 'Maestros', '/campanas', 90),
    ('COMPARATIVOS', 'Comparativos', 'Maestros', '/comparativos', 100),
    ('CENTRO_COSTOS', 'Centro de Costos', 'Maestros', '/centro-costos', 110)
on conflict (codigo) do nothing;

-- Solo Empresas se asigna a estas cuentas: prueba 2 QUERY, prueba 3 READER.
insert into public.usuario_modulo (id_usuario, id_modulo, nivel)
select u.id_usuario, m.id_modulo,
       case lower(concat_ws(' ', u.nombre, u.apellido))
           when 'prueba 2' then 'QUERY'
           when 'prueba 3' then 'READER'
       end
from public.usuarios u
cross join public.modulos m
where lower(concat_ws(' ', u.nombre, u.apellido)) in ('prueba 2', 'prueba 3')
  and u.estado = 'ACTIVO'
  and m.codigo = 'EMPRESAS'
on conflict (id_usuario, id_modulo) do update
set nivel = excluded.nivel,
    estado = true,
    updated_at = now();
