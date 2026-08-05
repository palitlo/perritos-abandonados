-- Ejecutar esto en Supabase: Dashboard > SQL Editor > New query > Run

create table if not exists perritos (
  id uuid primary key default gen_random_uuid(),
  lat double precision not null,
  lng double precision not null,
  descripcion text not null,
  foto_url text,
  estado text not null default 'visto',
  created_at timestamptz not null default now()
);

-- Habilitar Row Level Security
alter table perritos enable row level security;

-- Cualquiera puede leer los perritos marcados
create policy "Cualquiera puede ver perritos"
  on perritos for select
  using (true);

-- Cualquiera puede marcar un perrito nuevo (sitio abierto, sin login)
create policy "Cualquiera puede marcar un perrito"
  on perritos for insert
  with check (true);

-- Nota: a propósito NO se permite update/delete público, para que nadie
-- pueda borrar o alterar marcadores de otras personas desde el navegador.
-- Si más adelante querés moderar (marcar como "rescatado", borrar spam),
-- lo mejor es hacerlo desde el Table Editor de Supabase o agregar un login
-- de administrador.


-- ============================================================
-- Fotos subidas directamente (bucket de Storage "fotos")
-- El bucket ya se creó como público. Estas políticas son las que
-- faltan para que cualquiera pueda subir y ver esas fotos.
-- ============================================================

create policy "Cualquiera puede subir fotos de perritos"
  on storage.objects for insert
  with check (bucket_id = 'fotos');

create policy "Cualquiera puede ver fotos de perritos"
  on storage.objects for select
  using (bucket_id = 'fotos');

-- Tampoco acá se permite update/delete público, por la misma razón
-- que en la tabla perritos: evitar que se borren o reemplacen fotos
-- de otras personas desde el navegador.
