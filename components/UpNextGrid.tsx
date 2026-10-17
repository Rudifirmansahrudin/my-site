"use client";
// components/UpNextGrid.tsx
// Grid poster-saja untuk film yang belum direview. Klik poster → overlay berisi detail.
import { useRef, useState } from "react";
import { coverSwatch } from "@/lib/palette";

type UpNextMovie = {
  id: string;
  title: string;
  director: string | null;
  year: number | null;
  verdict: string | null;
  tags: string[] | null;
  poster_url: string | null;
  cover_color: string | null;
};

// Kotak poster. Kalau poster_url kosong, yang tampil kotak berwarna + judul.
function PosterBox({ movie, size, className = "" }: { movie: UpNextMovie; size: "sm" | "lg"; className?: string }) {
  const sw = coverSwatch(movie.title, movie.cover_color);
  return (
    <div
      className={`relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md ${className}`}
      style={{ backgroundColor: sw.bg, border: `1px solid ${sw.edge}` }}
    >
      {!movie.poster_url && (
        <span
          className={`absolute inset-0 flex items-end p-2.5 font-sans font-bold leading-tight text-gray-900 ${
            size === "sm" ? "text-xs" : "text-lg"
          }`}
        >
          {movie.title}
        </span>
      )}
      {movie.poster_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={movie.poster_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  );
}

export default function UpNextGrid({ movies, title = "Up next" }: { movies: UpNextMovie[]; title?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<UpNextMovie | null>(null);

  if (movies.length === 0) return null;

  // Makin banyak film, makin rapat gridnya (poster makin kecil)
  const cols =
    movies.length <= 12
      ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
      : movies.length <= 40
        ? "grid-cols-3 sm:grid-cols-5 lg:grid-cols-7"
        : "grid-cols-3 sm:grid-cols-5 lg:grid-cols-8";

  const openDetails = (m: UpNextMovie) => {
    setSelected(m);
    dialogRef.current?.showModal();
  };
  const closeDetails = () => dialogRef.current?.close();

  return (
    <section className="space-y-6">
      <h2 className="font-sans text-xl font-bold tracking-tight text-gray-900">{title}</h2>

      <ul className={`grid gap-x-4 gap-y-5 ${cols}`}>
        {movies.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => openDetails(m)}
              title={m.title}
              aria-label={`${m.title}, show details`}
              className="group block w-full rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900"
            >
              <PosterBox
                movie={m}
                size="sm"
                className="opacity-90 transition group-hover:opacity-100 group-hover:shadow-lg motion-safe:duration-200 motion-safe:group-hover:-translate-y-1"
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Overlay: <dialog> bawaan browser (Esc menutup, fokus terkunci, klik luar menutup) */}
      <dialog
        ref={dialogRef}
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeDetails();
        }}
        aria-labelledby="upnext-title"
        className="m-auto w-[min(92vw,34rem)] rounded-2xl border border-[#E4DAFB] bg-white p-0 shadow-2xl backdrop:bg-gray-900/40"
      >
        {selected && (
          <div className="relative flex gap-5 p-6">
            <button
              type="button"
              onClick={closeDetails}
              aria-label="Close"
              className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-[#F7F3FF] text-gray-700 hover:bg-[#E4DAFB]"
            >
              ✕
            </button>

            <div className="w-28 shrink-0 sm:w-36">
              <PosterBox movie={selected} size="lg" />
            </div>

            <div className="min-w-0 pr-8">
              <h3 id="upnext-title" className="text-xl font-bold leading-snug text-gray-900">
                {selected.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-gray-600">
                {[selected.year, selected.director].filter(Boolean).join(" · ")}
              </p>

              {(selected.tags ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selected.tags ?? []).map((t) => (
                    <span key={t} className="rounded-full bg-[#FBD3E5] px-2.5 py-0.5 font-mono text-[11px] font-bold text-gray-900">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {selected.verdict && (
                <p className="mt-4 text-sm leading-relaxed text-gray-700">{selected.verdict}</p>
              )}

              <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-gray-500">
                Review coming soon
              </p>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
