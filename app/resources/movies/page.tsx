// app/movies/page.tsx  (server component: data diambil dari Supabase, di-cache 60 detik)
import Link from "next/link";
import type { ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { coverSwatch, TINT, TINT_EDGE } from "@/lib/palette";

export const revalidate = 60;

export const metadata = {
  title: "Movies",
  description: "Reviews of the films everyone is talking about. Short verdict first, full review one click away.",
};

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
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-md shadow-md ${className}`}
      style={{ backgroundColor: sw.bg, border: `1px solid ${sw.edge}` }}
    >
      <span className="absolute inset-0 grid place-items-center p-3 text-center text-sm font-bold leading-snug text-gray-900">
        {movie.title}
      </span>
      {movie.poster_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={movie.poster_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {showRating && (
        <span className="absolute bottom-2 left-2 rounded border border-gray-900/10 bg-white/95 px-1.5 py-0.5 font-mono text-xs font-bold text-gray-900">
          {movie.rating!.toFixed(1)}
        </span>
      )}
    </div>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const reviewed = Boolean(movie.review_url);
  return (
    <ReviewLink movie={movie} className={`group block rounded-md ${focusRing}`}>
      <Poster
        movie={movie}
        className={`motion-safe:transition-transform motion-safe:duration-200 ${
          reviewed ? "motion-safe:group-hover:-translate-y-1" : "opacity-70"
        }`}
      />
      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-gray-900">{movie.title}</h3>
      <p className="mt-0.5 text-sm text-gray-600">
        {[movie.year, movie.director].filter(Boolean).join(" · ")}
      </p>
      {movie.verdict && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-700">{movie.verdict}</p>
      )}
      <p
        className={`mt-3 text-sm ${
          reviewed
            ? "font-semibold text-gray-900 underline decoration-[#B9A5F0] decoration-2 underline-offset-4 group-hover:decoration-gray-900"
            : "text-gray-500"
        }`}
      >
        {actionLabel(movie)}
        {reviewed && movie.spoiler_free && (
          <span className="ml-2 font-normal text-gray-500 no-underline">Spoiler-free</span>
        )}
      </p>
    </ReviewLink>
  );
}

function Featured({ movie }: { movie: Movie }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700">Latest review</h2>
      <div className="rounded-[14px] border p-5 sm:p-8" style={{ backgroundColor: TINT, borderColor: TINT_EDGE }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <Poster movie={movie} className="w-40 shrink-0 sm:w-52" />

          <div className="flex min-w-0 flex-col justify-center">
            <h3 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{movie.title}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {[movie.year, movie.director].filter(Boolean).join(" · ")}
              {movie.reviewed_at && <> · Reviewed {formatDate(movie.reviewed_at)}</>}
            </p>

            {movie.verdict && (
              <p className="mt-5 max-w-prose text-lg leading-relaxed text-gray-800">{movie.verdict}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              {movie.rating !== null && (
                <span className="font-mono font-bold text-gray-900">{movie.rating.toFixed(1)}/10</span>
              )}
              {movie.spoiler_free && (
                <span className="rounded-full bg-[#FFF0A8] px-2.5 py-0.5 text-xs text-gray-900">Spoiler-free</span>
              )}
              {(movie.tags ?? []).map((t) => (
                <span key={t} className="rounded-full bg-[#FBD3E5] px-2.5 py-0.5 text-xs text-gray-900">
                  {t}
                </span>
              ))}
            </div>

            <ReviewLink
              movie={movie}
              className={`mt-6 inline-flex w-fit items-center rounded-lg border border-[#B39CF0] bg-[#C9B8F5] px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-[#B9A5F0] ${focusRing}`}
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
    <section className="space-y-5">
      <h2 className="text-xl font-bold text-gray-700">{title}</h2>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((m) => (
          <li key={m.id}>
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
    <div className="space-y-14 pb-24">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold">Movies</h1>
        <p className="max-w-prose text-base leading-relaxed text-gray-600">
          Reviews of the films everyone is talking about. Short verdict first, full review one click away.
        </p>
      </header>

      {errorMsg && (
        <div className="rounded-lg border border-[#F2A9C9] bg-[#FBD3E5] p-4 font-mono text-sm text-gray-900">
          {errorMsg}
        </div>
      )}

      {!errorMsg && movies.length === 0 && <p className="text-gray-500">No reviews yet.</p>}

      {latest && <Featured movie={latest} />}
      <Grid title="All reviews" list={rest} />
      <Grid title="Up next" list={upNext} />
    </div>
  );
}
