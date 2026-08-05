"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { supabase, Perrito } from "@/lib/supabaseClient";

// Fix default marker icons (Leaflet + Next.js/webpack issue).
// Emojis fall outside Latin1, so btoa() can't encode them directly —
// URL-encode the SVG instead of base64-encoding it.
function svgDataUrl(fillColor: string, emoji: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z" fill="${fillColor}"/>
    <text x="16" y="21" font-size="18" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const dogIcon = new L.Icon({
  iconUrl: svgDataUrl("#e0592a", "🐶"),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});

const newMarkerIcon = new L.Icon({
  iconUrl: svgDataUrl("#2a7de0", "📍"),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -38],
});

type NewPoint = { lat: number; lng: number } | null;

function ClickHandler({ onPick }: { onPick: (p: NewPoint) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function NewMarkerForm({
  point,
  onCancel,
  onSaved,
}: {
  point: NewPoint;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [descripcion, setDescripcion] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [estado, setEstado] = useState("visto");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!point) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError("Contanos algo sobre el perrito (dónde está, cómo se ve).");
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("perritos").insert({
      lat: point.lat,
      lng: point.lng,
      descripcion: descripcion.trim(),
      foto_url: fotoUrl.trim() || null,
      estado,
    });
    setSaving(false);
    if (error) {
      setError("No se pudo guardar. Intentá de nuevo en un momento.");
      return;
    }
    setDescripcion("");
    setFotoUrl("");
    onSaved();
  };

  return (
    <Marker position={[point.lat, point.lng]} icon={newMarkerIcon}>
      <Popup autoClose={false} closeOnClick={false} minWidth={240}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <strong>Marcar perrito abandonado</strong>
          <textarea
            className="border rounded p-1 text-sm"
            placeholder="Descripción (raza, color, estado, referencia del lugar...)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
          />
          <input
            className="border rounded p-1 text-sm"
            placeholder="URL de foto (opcional)"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
          />
          <select
            className="border rounded p-1 text-sm"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="visto">Visto recientemente</option>
            <option value="rescatado">Ya fue rescatado</option>
            <option value="en_riesgo">En riesgo / necesita ayuda urgente</option>
          </select>
          {error && <span className="text-red-600 text-xs">{error}</span>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs px-2 py-1 rounded border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-xs px-2 py-1 rounded bg-orange-500 text-white disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Popup>
    </Marker>
  );
}

export default function Map() {
  const [perritos, setPerritos] = useState<Perrito[]>([]);
  const [newPoint, setNewPoint] = useState<NewPoint>(null);
  const [loading, setLoading] = useState(true);

  const loadPerritos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("perritos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPerritos(data as Perrito[]);
    setLoading(false);
  };

  useEffect(() => {
    loadPerritos();
  }, []);

  const defaultCenter: [number, number] = [-34.6037, -58.3816]; // Buenos Aires

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-3 py-1 rounded-full text-xs shadow">
          Cargando perritos...
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler
          onPick={(p) => {
            setNewPoint(p);
          }}
        />
        {perritos.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={dogIcon}>
            <Popup>
              <div className="flex flex-col gap-1 max-w-[220px]">
                {p.foto_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.foto_url}
                    alt="Foto del perrito"
                    className="w-full h-28 object-cover rounded"
                  />
                )}
                <span className="text-sm">{p.descripcion}</span>
                <span className="text-xs text-gray-500">
                  Estado:{" "}
                  {p.estado === "rescatado"
                    ? "Ya fue rescatado ✅"
                    : p.estado === "en_riesgo"
                    ? "En riesgo ⚠️"
                    : "Visto recientemente"}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
        <NewMarkerForm
          point={newPoint}
          onCancel={() => setNewPoint(null)}
          onSaved={() => {
            setNewPoint(null);
            loadPerritos();
          }}
        />
      </MapContainer>
    </div>
  );
}
