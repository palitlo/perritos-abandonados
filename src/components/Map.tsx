"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { supabase, Perrito } from "@/lib/supabaseClient";
import { compressImage } from "@/lib/compressImage";

const MAX_ORIGINAL_FILE_MB = 15;

// Cañuelas, Buenos Aires — centro y área de búsqueda por defecto.
const CANUELAS_CENTER: [number, number] = [-35.0505, -58.7626];
// Caja aproximada [lonMin, latMax, lonMax, latMin] para darle prioridad a
// resultados de búsqueda cercanos a Cañuelas (sin excluir el resto del país).
const CANUELAS_VIEWBOX = "-58.95,-34.90,-58.55,-35.25";

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function SearchBar({ mapRef }: { mapRef: React.RefObject<L.Map | null> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "json");
      url.searchParams.set("q", query.trim());
      url.searchParams.set("countrycodes", "ar");
      url.searchParams.set("viewbox", CANUELAS_VIEWBOX);
      url.searchParams.set("bounded", "0");
      url.searchParams.set("limit", "5");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("bad response");
      const data: SearchResult[] = await res.json();
      if (data.length === 0) {
        setError("No se encontró esa dirección o lugar.");
      } else {
        setResults(data);
      }
    } catch {
      setError("No se pudo buscar. Intentá de nuevo.");
    } finally {
      setSearching(false);
    }
  };

  const goTo = (r: SearchResult) => {
    mapRef.current?.flyTo([parseFloat(r.lat), parseFloat(r.lon)], 16);
    setResults([]);
    setQuery(r.display_name);
  };

  return (
    <div className="absolute top-2 left-2 z-[1000] w-[min(320px,calc(100vw-1rem))]">
      <form
        onSubmit={handleSearch}
        className="flex gap-1 bg-white rounded shadow px-1 py-1"
      >
        <input
          className="flex-1 text-sm px-2 py-1 outline-none min-w-0"
          placeholder="Buscar dirección o lugar en Cañuelas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={searching}
          className="text-xs px-2 py-1 rounded bg-orange-500 text-white disabled:opacity-50 shrink-0"
        >
          {searching ? "..." : "Buscar"}
        </button>
      </form>
      {error && (
        <div className="mt-1 bg-white rounded shadow px-2 py-1 text-xs text-red-600">
          {error}
        </div>
      )}
      {results.length > 0 && (
        <ul className="mt-1 bg-white rounded shadow overflow-hidden max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => goTo(r)}
                className="w-full text-left text-xs px-2 py-2 hover:bg-orange-50 border-b last:border-b-0"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [estado, setEstado] = useState("visto");
  const [saving, setSaving] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!point) return null;

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    if (!file) {
      setFotoFile(null);
      setFotoPreview(null);
      return;
    }
    if (file.size > MAX_ORIGINAL_FILE_MB * 1024 * 1024) {
      setError(`La foto es muy pesada (máx. ${MAX_ORIGINAL_FILE_MB}MB).`);
      e.target.value = "";
      return;
    }
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError("Contanos algo sobre el perrito (dónde está, cómo se ve).");
      return;
    }
    setSaving(true);
    setError(null);

    let fotoUrl: string | null = null;
    if (fotoFile) {
      setUploadingFoto(true);
      try {
        const compressed = await compressImage(fotoFile);
        const path = `${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("fotos")
          .upload(path, compressed, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage
          .from("fotos")
          .getPublicUrl(path);
        fotoUrl = publicData.publicUrl;
      } catch {
        setUploadingFoto(false);
        setSaving(false);
        setError("No se pudo subir la foto. Probá de nuevo.");
        return;
      }
      setUploadingFoto(false);
    }

    const { error } = await supabase.from("perritos").insert({
      lat: point.lat,
      lng: point.lng,
      descripcion: descripcion.trim(),
      foto_url: fotoUrl,
      estado,
    });
    setSaving(false);
    if (error) {
      setError("No se pudo guardar. Intentá de nuevo en un momento.");
      return;
    }
    setDescripcion("");
    setFotoFile(null);
    setFotoPreview(null);
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
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">
              Foto (opcional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-2 py-1.5 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 text-left"
            >
              {fotoFile ? `📷 ${fotoFile.name}` : "📷 Elegir o sacar foto"}
            </button>
            {fotoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoPreview}
                alt="Vista previa"
                className="w-full h-24 object-cover rounded"
              />
            )}
          </div>
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
              {uploadingFoto
                ? "Subiendo foto..."
                : saving
                ? "Guardando..."
                : "Guardar"}
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
  const mapRef = useRef<L.Map | null>(null);

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

  return (
    <div className="absolute inset-0">
      <SearchBar mapRef={mapRef} />
      {loading && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-3 py-1 rounded-full text-xs shadow">
          Cargando perritos...
        </div>
      )}
      <MapContainer
        ref={mapRef}
        center={CANUELAS_CENTER}
        zoom={13}
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
                <span className="text-[11px] font-semibold text-orange-600">
                  Perrito #{p.numero}
                </span>
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
