import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Lo invoca el cron de vercel.json una vez por semana. Una lectura mínima
// alcanza para que Supabase no pause el proyecto gratuito por inactividad.
export async function GET() {
  const { error } = await supabase.from("perritos").select("id").limit(1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
