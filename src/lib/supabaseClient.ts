import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Perrito = {
  id: string;
  numero: number;
  lat: number;
  lng: number;
  descripcion: string;
  foto_url: string | null;
  estado: string;
  created_at: string;
};
