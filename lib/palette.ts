// lib/palette.ts
// Satu-satunya tempat warna cover didefinisikan (dipakai Books & Movies).
// Teks di atas warna-warna ini selalu gelap (gray-900).

export type CoverColor = "red" | "yellow" | "green" | "blue" | "purple" | "pink" | "white";

// bg = warna isi, edge = warna garis tepi (sedikit lebih gelap)
// Catatan: key "red" sebenarnya peach/merah muda (#FCA5A5)
export const SWATCHES: Record<CoverColor, { bg: string; edge: string }> = {
  red: { bg: "#FCA5A5", edge: "#F28585" },
  yellow: { bg: "#FCD34D", edge: "#E3B91E" },
  green: { bg: "#86EFAC", edge: "#58D88A" },
  blue: { bg: "#93C5FD", edge: "#66A8F5" },
  purple: { bg: "#C4B5FD", edge: "#A290F7" },
  pink: { bg: "#F9A8D4", edge: "#EE82BC" },
  white: { bg: "#FFFFFF", edge: "#D1D5DB" },
};

// Warna pendukung halaman (panel, garis)
export const TINT = "#F7F3FF"; // latar panel (ungu sangat muda)
export const TINT_EDGE = "#E4DAFB";

// Urutan warna otomatis. Putih TIDAK ikut dipilih otomatis (cuma kalau lu set cover_color = 'white').
const AUTO: CoverColor[] = ["purple", "yellow", "green", "pink", "blue", "red"];

// Warna yang "mirip" (bertetangga di lingkaran warna): sebisa mungkin jangan ditumpuk berdampingan
const NEAR: Partial<Record<CoverColor, CoverColor[]>> = {
  purple: ["blue", "pink"],
  blue: ["purple", "green"],
  green: ["blue", "yellow"],
  yellow: ["green", "red"],
  red: ["yellow", "pink"],
  pink: ["red", "purple"],
};

export const hashString = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

const asColor = (c?: string | null): CoverColor | null =>
  c && Object.prototype.hasOwnProperty.call(SWATCHES, c) ? (c as CoverColor) : null;

/**
 * Warna cover kalau belum ada gambar.
 * - chosen = nilai kolom cover_color di Supabase
 * - kalau kosong / salah ketik, dipilih otomatis dari judul (selalu sama untuk judul yang sama)
 */
export function coverSwatch(title: string, chosen?: string | null) {
  const key = asColor(chosen) ?? AUTO[hashString(title) % AUTO.length];
  return { key, ...SWATCHES[key] };
}

/**
 * Warna untuk satu TUMPUKAN buku (urutan array = dari bawah ke atas).
 * Aturan:
 * - cover_color yang lu isi manual selalu dipakai apa adanya.
 * - sisanya otomatis: awalnya dari hash judul (stabil), lalu digeser kalau
 *   sama dengan buku di bawahnya / atasnya (yang sudah dipilih manual).
 * - kalau bisa, hindari juga warna yang "mirip" (mis. ungu di sebelah biru).
 */
export function assignStackSwatches(items: { title: string; cover_color?: string | null }[]) {
  const keys: CoverColor[] = [];

  items.forEach((item, i) => {
    const chosen = asColor(item.cover_color);
    if (chosen) {
      keys.push(chosen);
      return;
    }

    const prev = i > 0 ? keys[i - 1] : null;
    const next = i < items.length - 1 ? asColor(items[i + 1].cover_color) : null;

    const strict = new Set<CoverColor>();
    const loose = new Set<CoverColor>();
    for (const c of [prev, next]) {
      if (!c) continue;
      loose.add(c);
      strict.add(c);
      NEAR[c]?.forEach((n) => strict.add(n));
    }

    const start = hashString(item.title) % AUTO.length;
    const pick = (avoid: Set<CoverColor>) => {
      for (let k = 0; k < AUTO.length; k++) {
        const c = AUTO[(start + k) % AUTO.length];
        if (!avoid.has(c)) return c;
      }
      return null;
    };

    keys.push(pick(strict) ?? pick(loose) ?? AUTO[start]);
  });

  return keys.map((key) => ({ key, ...SWATCHES[key] }));
}
