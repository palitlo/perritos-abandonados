import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="bg-orange-500 text-white px-4 py-3 shadow z-10">
        <h1 className="text-lg font-semibold">🐶 Perritos Abandonados</h1>
        <p className="text-xs opacity-90">
          Hacé click en el mapa donde viste un perrito abandonado para
          marcarlo. Entre todos podemos ayudarlos.
        </p>
      </header>
      <main className="flex-1 relative">
        <MapWrapper />
      </main>
    </div>
  );
}
