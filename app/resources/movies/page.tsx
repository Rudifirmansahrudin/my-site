// app/movies/page.tsx  (server component: data diambil dari Supabase, selalu fresh)
import Link from "next/link";
import type { ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { coverSwatch, TINT, TINT_EDGE } from "@/lib/palette";

// Matikan cache: review baru langsung muncul tanpa nunggu
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Movies",
  description: "Reviews of the films everyone is talking about. Short verdict first, full review one click away.",
};

// DEBUG SEMENTARA: tampilkan host Supabase yang dipakai. Hapus setelah beres.
const supaHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : "(kosong)";

type Movie = {
  id: string;
  slug: string;
  title: string;
  director: string | null;
  year: number | null;
  rating: number | null;
  verdict: string | null;
  tags: string[] | null;
  poster_url: string | null;
  cover_color: string | null;
  review_url: string | null; // null = belum direview
  review_format: "article" | "video" | null;
  spoiler_free: boolean | null;
  reviewed_at: string | null;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const actionLabel = (m: Movie) =>
  !m.review_url ? "Review coming soon" : m.review_format === "video" ? "Watch review" : "Read review";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900";

function ReviewLink({ movie, className, children }: { movie: Movie; className?: string; children: ReactNode }) {
  const url = movie.review_url;
  if (!url) return <div className={className}>{children}</div>;
  if (url.startsWith("/")) return <Link href={url} className={className}>{children}</Link>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

// Warna cover ada di bawah gambar: kalau poster kosong / gagal load, yang kelihatan kotak rapi.
function Poster({ movie, className = "" }: { movie: Movie; className?: string }) {
  const sw = coverSwatch(movie.title, movie.cover_color);
  const showRating = movie.review_url && movie.rating !== null;
  
  return (
    // DI SINI KUNCINYA: w-full aspect-[2/3] memastikan rasio selalu poster film
    <div
      className={`relative w-full aspect-[2/3] overflow-hidden rounded-lg shadow-md ${className}`}
      style={{ backgroundColor: sw.bg, border: `1px solid ${sw.edge}` }}
    >
      {/* Jika tidak ada poster URL, tampilkan judul di pojok kiri bawah (Bold typography style) */}
      {!movie.poster_url && (
         <div className="absolute inset-0 flex items-end justify-start p-4 bg-gradient-to-t from-black/10 to-transparent">
            <span className="text-xl md:text-2xl font-bold font-sans text-gray-900 leading-tight drop-shadow-sm">
                {movie.title}
            </span>
         </div>
      )}
      
      {movie.poster_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={movie.poster_url} alt={movie.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      )}
      
      {showRating && (
        <span className="absolute bottom-3 left-3 z-10 rounded border border-gray-900/10 bg-white/95 px-1.5 py-0.5 font-mono text-xs font-bold text-gray-900 shadow-sm">
          {Number(movie.rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const reviewed = Boolean(movie.review_url);
  return (
    <ReviewLink movie={movie} className={`group block rounded-md ${focusRing} flex flex-col h-full`}>
      <Poster
        movie={movie}
        className={`motion-safe:transition-transform motion-safe:duration-300 ${
          reviewed ? "motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:shadow-xl" : "opacity-90 motion-safe:group-hover:-translate-y-1"
        }`}
      />
      <div className="mt-4 flex flex-col flex-grow">
        <h3 className="line-clamp-2 text-lg font-bold font-sans leading-snug text-gray-900">{movie.title}</h3>
        <p className="mt-1 text-xs font-mono tracking-wide text-gray-500">
          {[movie.year, movie.director].filter(Boolean).join(" · ")}
        </p>
        
        {/* Verdict: Dibuat seperti quote tipis */}
        {movie.verdict && (
          <div className="mt-3 border-l-2 border-indigo-200 pl-3">
             <p className="line-clamp-3 text-sm font-sans leading-relaxed text-gray-600 italic">"{movie.verdict}"</p>
          </div>
        )}
        
        {/* Action / Review Link selalu terdorong ke bawah */}
        <p
          className={`mt-auto pt-4 text-xs font-mono uppercase tracking-widest ${
            reviewed
              ? "font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              : "text-gray-400"
          }`}
        >
          {actionLabel(movie)}
          {reviewed && movie.spoiler_free && (
            <span className="ml-3 font-normal text-gray-400 no-underline lowercase tracking-normal">Spoiler-free</span>
          )}
        </p>
      </div>
    </ReviewLink>
  );
}

function Featured({ movie }: { movie: Movie }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold font-sans tracking-tight text-gray-900">Latest review</h2>
      <div className="rounded-[16px] border p-6 sm:p-8 shadow-sm transition-all" style={{ backgroundColor: TINT, borderColor: TINT_EDGE }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
          {/* Lebar poster Featured dipastikan dengan max-w */}
          <div className="w-full sm:w-48 lg:w-56 shrink-0 mx-auto sm:mx-0">
             <Poster movie={movie} className="w-full shadow-lg" />
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <h3 className="text-3xl font-extrabold font-sans tracking-tight leading-tight text-gray-900 md:text-4xl">{movie.title}</h3>
            <p className="mt-2 text-sm font-mono text-gray-600">
              {[movie.year, movie.director].filter(Boolean).join(" · ")}
              {movie.reviewed_at && <> <span className="mx-2">|</span> {formatDate(movie.reviewed_at)}</>}
            </p>

            {movie.verdict && (
              <p className="mt-6 max-w-2xl text-lg font-sans leading-relaxed text-gray-700">{movie.verdict}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              {movie.rating !== null && (
                <span className="font-mono font-bold text-lg text-indigo-600">{Number(movie.rating).toFixed(1)}/10</span>
              )}
              {movie.spoiler_free && (
                <span className="rounded-full bg-[#FFF0A8] px-3 py-1 text-xs font-bold font-mono text-yellow-900">Spoiler-free</span>
              )}
              {(movie.tags ?? []).map((t) => (
                <span key={t} className="rounded-full bg-[#FBD3E5] px-3 py-1 text-xs font-bold font-mono text-pink-900">
                  {t}
                </span>
              ))}
            </div>

            <ReviewLink
              movie={movie}
              className={`mt-8 inline-flex w-fit items-center rounded-full border border-[#B39CF0] bg-[#C9B8F5] px-6 py-3 text-sm font-bold font-sans text-indigo-900 hover:bg-[#B9A5F0] transition-colors shadow-sm ${focusRing}`}
            >
              {movie.review_format === "video" ? "Watch the review" : "Read the full review"}
            </ReviewLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Grid({ title, list }: { title: string; list: Movie[] }) {
  if (list.length === 0) return null;
  return (
    <section className="space-y-6 pt-6">
      <h2 className="text-xl font-bold font-sans tracking-tight text-gray-900">{title}</h2>
      {/* Menggunakan grid-cols-2 di HP, 3 di tablet, 4 di desktop besar */}
      <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((m) => (
          <li key={m.id} className="flex">
            <MovieCard movie={m} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function MoviesPage() {
  let movies: Movie[] = [];
  let errorMsg = "";

  if (!isSupabaseConfigured) {
    errorMsg = "Supabase keys are missing. Fill in .env.local.";
  } else {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("reviewed_at", { ascending: false, nullsFirst: false })
      .order("sort_order", { ascending: true });
    if (error) errorMsg = error.message;
    else movies = (data as Movie[]) ?? [];
  }

  const reviewed = movies.filter((m) => m.review_url);
  const [latest, ...rest] = reviewed;
  const upNext = movies.filter((m) => !m.review_url);

  return (
    <div className="space-y-16 pb-24 max-w-6xl mx-auto">
      <header className="space-y-4 text-center md:text-left pt-6">
        <h1 className="text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-gray-900">Movies</h1>
        <p className="max-w-2xl text-base md:text-lg leading-relaxed font-sans text-gray-600 mx-auto md:mx-0">
          Reviews of the films everyone is talking about. Short verdict first, full review one click away.
        </p>
      </header>

      {/* DEBUG SEMENTARA: hapus baris ini kalau data sudah muncul */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 w-fit mx-auto md:mx-0">
        <p className="font-mono text-xs text-gray-400">
            debug: {supaHost} · {movies.length} rows{errorMsg ? ` · ${errorMsg}` : ""}
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-[#F2A9C9] bg-[#FBD3E5] p-6 font-mono text-sm text-pink-900 shadow-sm">
          {errorMsg}
        </div>
      )}

      {!errorMsg && movies.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500 font-mono">
              No reviews yet.
          </div>
      )}

      {/* Sengaja dimatikan sementara karena 'latest' dari dummy data belum punya review_url. 
          Buka comment-nya nanti kalau review pertama lu udah ada.
      */}
      {/* {latest && <Featured movie={latest} />} */}
      
      {/* Sementara dummy data belum direview, tampilkan semuanya di 'Up next' */}
      <Grid title="Up next" list={upNext} />
      {/* <Grid title="All reviews" list={rest} /> */}
    </div>
  );
}
