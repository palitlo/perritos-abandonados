import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con privilegios de administrador (bypassea RLS).
 * SOLO se debe importar desde código que corre en el servidor
 * (Route Handlers de app/api/**), nunca desde un componente de cliente,
 * porque SUPABASE_SECRET_KEY no lleva el prefijo NEXT_PUBLIC_ y no debe
 * llegar nunca al navegador.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const secretKey = process.env.SUPABASE_SECRET_KEY as string;
  if (!url || !secretKey) {
    throw new Error("Faltan variables de entorno de administrador");
  }
  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}
