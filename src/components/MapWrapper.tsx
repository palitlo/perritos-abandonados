"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      Cargando mapa...
    </div>
  ),
});

export default function MapWrapper() {
  return <Map />;
}
