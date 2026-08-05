import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="bg-orange-500 text-white px-4 py-3 shadow z-10 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">🐶 Perritos Abandonados</h1>
          <p className="text-xs opacity-90">
            Hacé click en el mapa donde viste un perrito abandonado para
            marcarlo. Entre todos podemos ayudarlos.
          </p>
        </div>
        <a
          href="https://www.instagram.com/cuchitascanuelas_/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 shrink-0 text-xs font-medium bg-white/15 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d="M12 2c-2.717 0-3.056.012-4.123.06-1.065.049-1.79.218-2.427.465a4.902 4.902 0 0 0-1.771 1.153A4.902 4.902 0 0 0 2.525 5.45c-.247.637-.416 1.362-.465 2.427C2.012 8.944 2 9.283 2 12s.012 3.056.06 4.123c.049 1.065.218 1.79.465 2.427a4.902 4.902 0 0 0 1.153 1.771 4.902 4.902 0 0 0 1.771 1.153c.637.247 1.362.416 2.427.465C8.944 21.988 9.283 22 12 22s3.056-.012 4.123-.06c1.065-.049 1.79-.218 2.427-.465a4.902 4.902 0 0 0 1.771-1.153 4.902 4.902 0 0 0 1.153-1.771c.247-.637.416-1.362.465-2.427.048-1.067.06-1.406.06-4.123s-.012-3.056-.06-4.123c-.049-1.065-.218-1.79-.465-2.427a4.902 4.902 0 0 0-1.153-1.771 4.902 4.902 0 0 0-1.771-1.153c-.637-.247-1.362-.416-2.427-.465C15.056 2.012 14.717 2 12 2Zm0 1.802c2.67 0 2.987.01 4.042.059.976.045 1.505.207 1.858.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.858.048 1.055.059 1.372.059 4.042 0 2.67-.01 2.987-.059 4.042-.045.976-.207 1.505-.344 1.858-.182.466-.399.8-.748 1.15-.35.35-.683.566-1.15.748-.353.137-.882.3-1.858.344-1.054.048-1.372.059-4.042.059-2.67 0-2.987-.01-4.042-.059-.976-.045-1.505-.207-1.858-.344a3.097 3.097 0 0 1-1.15-.748 3.098 3.098 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.858-.048-1.055-.059-1.372-.059-4.042 0-2.67.01-2.987.059-4.042.045-.976.207-1.505.344-1.858.182-.467.399-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.858-.344C9.013 3.812 9.33 3.802 12 3.802Zm0 3.063a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27Zm0 8.468a3.333 3.333 0 1 1 0-6.666 3.333 3.333 0 0 1 0 6.666Zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z" />
          </svg>
          @cuchitascanuelas_
        </a>
      </header>
      <main className="flex-1 relative">
        <MapWrapper />
      </main>
    </div>
  );
}
