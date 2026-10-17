// app/about/wall/page.tsx  →  URL: /about/wall
import Link from "next/link";
import type { CSSProperties } from "react";
import { Caveat } from "next/font/google";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { coverSwatch, hashString, TINT, TINT_EDGE } from "@/lib/palette";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wall of My Life",
  description: "Framed characters, sticky notes, posters, and notes from inside my head.",
};

// Font tulisan tangan buat sticky notes
const hand = Caveat({ subsets: ["latin"], display: "swap" });

type WallItem = {
  id: string;
  kind: "frame" | "sticky" | "poster";
  title: string | null;
  caption: string | null;
  body: string | null;
  image_url: string | null;
  color: string | null;
  rotation: number | null;
  sort_order: number | null;
};

type WallNote = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  mood: string | null;
  color: string | null;
  published_at: string | null;
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900";

// Kemiringan: pakai nilai dari DB kalau ada, kalau gak otomatis (stabil per item)
const tilt = (item: WallItem, range: number) =>
  item.rotation !== null && item.rotation !== undefined
    ? Number(item.rotation)
    : ((hashString(item.id) % 61) / 10) * (range / 3) - range;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* ---------- Hiasan: lakban & paku payung ---------- */
function Tape() {
  return (
    <span
      aria-hidden
      className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-3 border border-white/70 bg-white/60 shadow-sm"
    />
  );
}

function Pin() {
  return (
    <span
      aria-hidden
      className="absolute -top-2 left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full border border-[#EE82BC] bg-[#F9A8D4] shadow-md"
    />
  );
}

/* ---------- Foto bingkai (karakter favorit) ---------- */
function Frame({ item }: { item: WallItem }) {
  const sw = coverSwatch(item.title ?? item.id, item.color);
  const deg = tilt(item, 1.5);

  return (
    <div className="mx-auto w-full max-w-[250px]">
      <figure className="relative" style={{ transform: `rotate(${deg}deg)`, transformOrigin: "50% 0" }}>
        {/* paku + tali */}
        <span
          aria-hidden
          className="absolute top-0 left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border border-gray-400 bg-gray-200 shadow"
        />
        <svg
          aria-hidden
          viewBox="0 0 100 48"
          preserveAspectRatio="none"
          className="block h-12 w-full text-gray-400"
        >
          <path
            d="M50 2 L8 48 M50 2 L92 48"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* bingkai + matte putih */}
        <div className="border-[10px] border-gray-900 bg-white p-3 shadow-xl">
          <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: sw.bg }}>
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.title ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center p-4 text-center text-lg font-bold leading-tight text-gray-900">
                {item.title}
              </span>
            )}
          </div>
        </div>
      </figure>

      {/* plakat nama (tidak ikut miring) */}
      <div className="mx-auto mt-5 max-w-[220px] rounded-md border border-gray-200 bg-white px-3 py-2 text-center shadow-sm">
        {item.title && <p className="text-sm font-bold leading-snug text-gray-900">{item.title}</p>}
        {item.caption && <p className="mt-0.5 font-mono text-xs text-gray-600">{item.caption}</p>}
        {item.body && <p className="mt-2 line-clamp-3 text-xs italic leading-relaxed text-gray-600">{item.body}</p>}
      </div>
    </div>
  );
}

/* ---------- Sticky note (quote) ---------- */
function Sticky({ item }: { item: WallItem }) {
  const sw = coverSwatch(item.body ?? item.id, item.color);
  const deg = tilt(item, 3);

  return (
    <div
      className="relative px-5 pt-7 pb-5 shadow-[0_10px_18px_-8px_rgba(17,24,39,0.35)] transition-transform duration-200 [transform:rotate(var(--r))] hover:[transform:rotate(0deg)_scale(1.03)]"
      style={{ backgroundColor: sw.bg, "--r": `${deg}deg` } as CSSProperties}
    >
      <Tape />
      <p className={`${hand.className} text-[24px] font-medium leading-[1.2] text-gray-900`}>{item.body}</p>
      {item.caption && <p className="mt-3 font-mono text-[11px] text-gray-700">— {item.caption}</p>}
    </div>
  );
}

/* ---------- Poster ---------- */
function PosterItem({ item }: { item: WallItem }) {
  const sw = coverSwatch(item.title ?? item.id, item.color);
  const deg = tilt(item, 2);

  return (
    <figure
      className="relative transition-transform duration-200 [transform:rotate(var(--r))] hover:[transform:rotate(0deg)_scale(1.02)]"
      style={{ "--r": `${deg}deg` } as CSSProperties}
    >
      <Pin />
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.title ?? ""}
          loading="lazy"
          className="block w-full border-4 border-white bg-white shadow-lg"
        />
      ) : (
        <div
          className="flex aspect-[2/3] items-end border-4 border-white p-4 shadow-lg"
          style={{ backgroundColor: sw.bg }}
        >
          <span className="text-lg font-bold leading-tight text-gray-900">{item.title}</span>
        </div>
      )}
      {item.image_url && (item.title || item.caption) && (
        <figcaption className="mt-2 text-center font-mono text-[11px] text-gray-600">
          {[item.title, item.caption].filter(Boolean).join(" · ")}
        </figcaption>
      )}
    </figure>
  );
}

/* ---------- Kartu catatan pribadi ---------- */
function NoteCard({ note }: { note: WallNote }) {
  const sw = coverSwatch(note.title, note.color);
  return (
    <Link
      href={`/about/wall/${note.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition motion-safe:hover:-translate-y-1 hover:shadow-md ${focusRing}`}
    >
      <div className="h-2" style={{ backgroundColor: sw.bg }} />
      <div className="flex flex-grow flex-col p-5">
        {note.mood && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500">{note.mood}</p>
        )}
        <h3 className="mt-2 text-lg font-bold leading-snug text-gray-900">{note.title}</h3>
        {note.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{note.excerpt}</p>}
        <p className="mt-auto flex items-center justify-between pt-5 text-xs text-gray-500">
          <span>{note.published_at ? formatDate(note.published_at) : ""}</span>
          <span className="font-semibold text-gray-900 underline decoration-[#B9A5F0] decoration-2 underline-offset-4 group-hover:decoration-gray-900">
            Read note
          </span>
        </p>
      </div>
    </Link>
  );
}

/* ---------- Page ---------- */
export default async function WallPage() {
  let items: WallItem[] = [];
  let notes: WallNote[] = [];
  let errorMsg = "";

  if (!isSupabaseConfigured) {
    errorMsg = "Supabase keys are missing. Fill in .env.local.";
  } else {
    const [itemsRes, notesRes] = await Promise.all([
      supabase
        .from("wall_items")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true }),
      supabase
        .from("wall_notes")
        .select("id,slug,title,excerpt,mood,color,published_at")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false }),
    ]);
    if (itemsRes.error) errorMsg = itemsRes.error.message;
    else items = (itemsRes.data as unknown as WallItem[]) ?? [];
    if (notesRes.error) errorMsg = errorMsg || notesRes.error.message;
    else notes = (notesRes.data as unknown as WallNote[]) ?? [];
  }

  const frames = items.filter((i) => i.kind === "frame");
  const collage = items.filter((i) => i.kind !== "frame");

  return (
    <div className="space-y-14 pb-24">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Wall of My Life</h1>
        <p className="max-w-prose text-base leading-relaxed text-gray-600">
          The things that live in my head: characters I look up to, lines I keep, and notes that are not quite
          articles.
        </p>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-[#F2A9C9] bg-[#FBD3E5] p-6 font-mono text-sm text-gray-900 shadow-sm">
          {errorMsg}
        </div>
      )}

      {/* ===== Dinding ===== */}
      <section
        aria-label="The wall"
        className="rounded-[20px] border p-6 sm:p-10"
        style={{
          backgroundColor: TINT,
          borderColor: TINT_EDGE,
          backgroundImage: "radial-gradient(#E4DAFB 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
      >
        {items.length === 0 && !errorMsg && (
          <p className="py-16 text-center font-mono text-sm text-gray-500">
            The wall is empty. Add rows to the wall_items table in Supabase.
          </p>
        )}

        {frames.length > 0 && (
          <div>
            <p className={`${hand.className} mb-8 text-center text-3xl font-medium text-gray-700`}>
              my favorite characters
            </p>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {frames.map((f) => (
                <Frame key={f.id} item={f} />
              ))}
            </div>
          </div>
        )}

        {collage.length > 0 && (
          <ul className={`columns-2 gap-6 sm:columns-3 ${collage.length > 9 ? "lg:columns-4" : ""}`}>
            {collage.map((c) => (
              <li key={c.id} className="mb-8 break-inside-avoid">
                {c.kind === "sticky" ? <Sticky item={c} /> : <PosterItem item={c} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ===== Catatan pribadi ===== */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Inside my head</h2>
          <p className="max-w-prose text-sm leading-relaxed text-gray-600">
            Personal notes. Unpolished, and separate from the articles in Writing.
          </p>
        </div>

        {notes.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center font-mono text-sm text-gray-500">
            No notes yet.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => (
              <li key={n.id}>
                <NoteCard note={n} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
