// app/resources/movies/page.tsx  →  URL: /resources/movies  (server component: data diambil dari Supabase, selalu fresh)
import Link from "next/link";
import type { ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { coverSwatch, TINT, TINT_EDGE } from "@/lib/palette";
import UpNextGrid from "@/components/UpNextGrid";

// Matikan cache: review baru langsung muncul tanpa nunggu
export const dynamic = "force-dynamic";

// Alamat dasar halaman Movies (harus sama dengan lokasi folder + link di Navbar)
const MOVIES_BASE = "/resources/movies";

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
  review_url: string | null; // link review di luar web (mis. YouTube)
  review_format: "article" | "video" | null;
  spoiler_free: boolean | null;
  reviewed_at: string | null;
  has_article?: boolean | null; // ada kalau lu sudah jalanin movies-article.sql
};

// Artikel di web sendiri (/movies/<slug>) menang; kalau gak ada, pakai link luar.
const reviewHref = (m: Movie) => (m.has_article ? `${MOVIES_BASE}/${m.slug}` : m.review_url);

const isVideoOnly = (m: Movie) => !m.has_article && m.review_format === "video";

const actionLabel = (m: Movie) =>
  !reviewHref(m) ? "Review coming soon" : isVideoOnly(m) ? "Watch review" : "Read review";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900";

function ReviewLink({ href, className, children }: { href: string | null; className?: string; children: ReactNode }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith("/")) return <Link href={href} className={className}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

// Warna cover ada di bawah gambar: kalau poster kosong / gagal load, yang kelihatan kotak rapi.
function Poster({
  movie,
  className = "",
  showRating = false,
  size = "md",
}: {
  movie: Movie;
  className?: string;
  showRating?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sw = coverSwatch(movie.title, movie.cover_color);
  const titleSize = size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm";

  return (
    <div
      className={`relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md ${className}`}
      style={{ backgroundColor: sw.bg, border: `1px solid ${sw.edge}` }}
    >
      {!movie.poster_url && (
        <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/10 to-transparent p-3">
          <span className={`font-sans font-bold leading-tight text-gray-900 ${titleSize}`}>{movie.title}</span>
        </div>
      )}

      {movie.poster_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={movie.poster_url}
          alt={movie.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {showRating && movie.rating !== null && (
        <span className="absolute bottom-2 left-2 z-10 rounded border border-gray-900/10 bg-white/95 px-1.5 py-0.5 font-mono text-xs font-bold text-gray-900 shadow-sm">
          {Number(movie.rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const href = reviewHref(movie);
  const reviewed = Boolean(href);
  return (
    <ReviewLink href={href} className={`group flex h-full flex-col rounded-md ${focusRing}`}>
      <Poster
        movie={movie}
        showRating={reviewed}
        size="md"
        className={`motion-safe:transition-transform motion-safe:duration-300 ${
          reviewed
            ? "motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:shadow-xl"
            : "opacity-90 motion-safe:group-hover:-translate-y-1"
        }`}
      />
      <div className="mt-4 flex flex-grow flex-col">
        <h3
          className="line-clamp-2 font-sans text-lg font-bold leading-snug text-gray-900"
        >
          {movie.title}
        </h3>
        <p className="mt-1 font-mono text-xs tracking-wide text-gray-500">
          {[movie.year, movie.director].filter(Boolean).join(" · ")}
        </p>

        {movie.verdict && (
          <div className="mt-3 border-l-2 border-[#B9A5F0] pl-3">
            <p
              className="line-clamp-3 font-sans text-sm italic leading-relaxed text-gray-600"
            >
              “{movie.verdict}”
            </p>
          </div>
        )}

        <p
          className={`mt-auto pt-4 font-mono text-xs uppercase tracking-widest ${
            reviewed
              ? "font-bold text-gray-900 underline decoration-[#B9A5F0] decoration-2 underline-offset-4 group-hover:decoration-gray-900"
              : "text-gray-400"
          }`}
        >
          {actionLabel(movie)}
          {reviewed && movie.spoiler_free && (
            <span className="ml-3 font-normal lowercase tracking-normal text-gray-500 no-underline">Spoiler-free</span>
          )}
        </p>
      </div>
    </ReviewLink>
  );
}

function Featured({ movie }: { movie: Movie }) {
  return (
    <section className="space-y-4">
      <h2 className="font-sans text-xl font-bold tracking-tight text-gray-900">Latest review</h2>
      <div
        className="rounded-[16px] border p-6 shadow-sm sm:p-8"
        style={{ backgroundColor: TINT, borderColor: TINT_EDGE }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
          <div className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-48">
            <Poster movie={movie} showRating size="lg" className="shadow-lg" />
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <h3 className="font-sans text-3xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-4xl">
              {movie.title}
            </h3>
            <p className="mt-2 font-mono text-sm text-gray-600">
              {[movie.year, movie.director].filter(Boolean).join(" · ")}
              {movie.reviewed_at && (
                <>
                  {" "}
                  <span className="mx-2">|</span> {formatDate(movie.reviewed_at)}
                </>
              )}
            </p>

            {movie.verdict && (
              <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-gray-700">{movie.verdict}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              {movie.rating !== null && (
                <span className="font-mono text-lg font-bold text-gray-900">{Number(movie.rating).toFixed(1)}/10</span>
              )}
              {movie.spoiler_free && (
                <span className="rounded-full bg-[#FFF0A8] px-3 py-1 font-mono text-xs font-bold text-gray-900">
                  Spoiler-free
                </span>
              )}
              {(movie.tags ?? []).map((t) => (
                <span key={t} className="rounded-full bg-[#FBD3E5] px-3 py-1 font-mono text-xs font-bold text-gray-900">
                  {t}
                </span>
              ))}
            </div>

            <ReviewLink
              href={reviewHref(movie)}
              className={`mt-8 inline-flex w-fit items-center rounded-full border border-[#B39CF0] bg-[#C9B8F5] px-6 py-3 font-sans text-sm font-bold text-gray-900 shadow-sm transition-colors hover:bg-[#B9A5F0] ${focusRing}`}
            >
              {isVideoOnly(movie) ? "Watch the review" : "Read the full review"}
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
    <section className="space-y-6">
      <h2 className="font-sans text-xl font-bold tracking-tight text-gray-900">{title}</h2>
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

  const reviewed = movies.filter((m) => reviewHref(m));
  const [latest, ...rest] = reviewed;
  const upNext = movies.filter((m) => !reviewHref(m));

  return (
    <div className="space-y-14 pb-24">
      <header className="space-y-3">
        <h1 className="font-sans text-4xl font-bold tracking-tight text-gray-900">Movies</h1>
        <p className="max-w-prose font-sans text-base leading-relaxed text-gray-600">
          Reviews of the films everyone is talking about. Short verdict first, full review one click away.
        </p>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-[#F2A9C9] bg-[#FBD3E5] p-6 font-mono text-sm text-gray-900 shadow-sm">
          {errorMsg}
        </div>
      )}

      {!errorMsg && movies.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center font-mono text-gray-500">
          No reviews yet.
        </div>
      )}

      {/* Otomatis muncul begitu ada film yang sudah punya review (artikel atau link) */}
      {latest && <Featured movie={latest} />}
      <Grid title="All reviews" list={rest} />
      <UpNextGrid movies={upNext} />
    </div>
  );
}
