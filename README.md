# 🐶 Perritos Abandonados

Sitio benéfico donde cualquier persona puede marcar en un mapa dónde vio un
perrito abandonado, para que otros puedan ayudarlo o rescatarlo.

- Mapa: OpenStreetMap + Leaflet (gratis, sin API key)
- Base de datos: Supabase (Postgres gratis)
- Deploy: Vercel

## 1. Crear el proyecto en Supabase

1. Andá a https://supabase.com y creá una cuenta / iniciá sesión (es gratis).
2. Creá un proyecto nuevo (elegí cualquier nombre, ej. `perritos-abandonados`).
3. Cuando el proyecto esté listo, andá a **SQL Editor** y ejecutá el contenido
   del archivo [`supabase.sql`](./supabase.sql) de este repo. Esto crea la
   tabla `perritos` y los permisos para que cualquiera pueda ver y marcar
   perritos, sin poder borrar los de otros.
4. Andá a **Project Settings > API** y copiá:
   - `Project URL`
   - `anon public` key

## 2. Configurar las variables de entorno

Copiá `.env.local.example` a `.env.local` y completá con los datos de
Supabase:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Correr en local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000

## 4. Deploy en Vercel

1. Subí este proyecto a un repositorio de GitHub.
2. En https://vercel.com, importá el repositorio.
3. En **Environment Variables**, agregá las mismas dos variables de
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. Listo, el sitio queda público.

## Cómo funciona

- Cualquier visitante puede hacer click en el mapa para marcar un perrito:
  se abre un formulario chico donde pone una descripción, estado (visto /
  en riesgo / ya rescatado) y opcionalmente una URL de foto.
- Todos los marcadores se guardan en Supabase y se muestran a todos los
  visitantes en tiempo real (al recargar la página).
- No hace falta cuenta ni login para marcar un perrito — está pensado para
  que sea lo más fácil posible de usar.

## Posibles mejoras a futuro

- Subida de fotos directa (con Supabase Storage) en vez de pegar una URL.
- Panel de moderación para borrar marcadores duplicados o spam.
- Filtro por estado (solo mostrar "en riesgo", etc.).
- Botón de "compartir ubicación actual" usando geolocalización del navegador.
