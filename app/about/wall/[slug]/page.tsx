// app/about/wall/[slug]/page.tsx  →  URL: /about/wall/<slug>  (satu catatan pribadi)
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { coverSwatch } from "@/lib/palette";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

type Note = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  mood: string | null;
  color: string | null;
  published_at: string | null;
};

type Props = { params: Promise<{ slug: string }> };

async function getNote(slug: string): Promise<Note | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase
    .from("wall_notes")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Note | null) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) return { title: "Wall of My Life" };
  return { title: note.title, description: note.excerpt ?? undefined };
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = await getNote(slug);
  if (!note) notFound();

  const sw = coverSwatch(note.title, note.color);
  const minutes = Math.max(1, Math.round(note.body.trim().split(/\s+/).length / 200));

  return (
    <article className="pb-24">
      <Link
        href="/about/wall"
        className="text-sm text-gray-600 underline decoration-[#B9A5F0] decoration-2 underline-offset-4 hover:text-gray-900"
      >
        ← Wall of My Life
      </Link>

      <header className="mt-6 max-w-[65ch]">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {note.mood && (
            <span
              className="rounded-full px-3 py-1 font-mono text-xs font-bold text-gray-900"
              style={{ backgroundColor: sw.bg }}
            >
              {note.mood}
            </span>
          )}
          <span>
            {note.published_at && <>{formatDate(note.published_at)} · </>}
            {minutes} min read
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{note.title}</h1>
        {note.excerpt && <p className="mt-4 text-lg leading-relaxed text-gray-700">{note.excerpt}</p>}
      </header>

      <div className="mt-10 max-w-[65ch] text-[17px] leading-8 text-gray-800">
        <Markdown>{note.body}</Markdown>
      </div>

      <div className="mt-14 border-t border-gray-200 pt-6">
        <Link
          href="/about/wall"
          className="text-sm font-semibold text-gray-900 underline decoration-[#B9A5F0] decoration-2 underline-offset-4 hover:decoration-gray-900"
        >
          ← Back to the wall
        </Link>
      </div>
    </article>
  );
}
