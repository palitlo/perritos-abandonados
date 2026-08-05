import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Retraso artificial ante contraseña incorrecta, como freno básico
// contra intentos automatizados de adivinarla.
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  let body: {
    id?: string;
    accion?: "rescatado" | "eliminar";
    password?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { id, accion, password } = body;

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "El servidor no tiene configurada la contraseña de administrador" },
      { status: 500 }
    );
  }

  if (!password || password !== adminPassword) {
    await delay(500);
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  if (!id || (accion !== "rescatado" && accion !== "eliminar")) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  if (accion === "eliminar") {
    const { error } = await supabaseAdmin.from("perritos").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // accion === "rescatado"
  const { error } = await supabaseAdmin
    .from("perritos")
    .update({ estado: "rescatado" })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
