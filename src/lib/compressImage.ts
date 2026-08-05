/**
 * Redimensiona y comprime una imagen en el navegador antes de subirla,
 * para no gastar de más el almacenamiento gratuito de Supabase.
 * Devuelve un Blob JPEG liviano (normalmente entre 100KB y 400KB).
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  quality = 0.8
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("No se pudo comprimir la imagen");
  return blob;
}
