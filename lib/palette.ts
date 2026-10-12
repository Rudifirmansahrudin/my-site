// lib/palette.ts
// Satu-satunya tempat warna cover didefinisikan (dipakai Books & Movies).
// Palet: ungu muda, pink muda, kuning muda, putih. Teks di atasnya selalu gelap.

export type CoverColor = "purple" | "pink" | "yellow" | "white";

export const SWATCHES: Record<CoverColor, { bg: string; edge: string }> = {
  purple: { bg: "#DCD0FA", edge: "#B9A5F0" },
  pink: { bg: "#FBD3E5", edge: "#F2A9C9" },
  yellow: { bg: "#FFF0A8", edge: "#EBD66B" },
  white: { bg: "#FFFFFF", edge: "#D1D5DB" },
};

// Warna pendukung halaman (panel, tombol, garis)
export const TINT = "#F7F3FF"; // latar panel (ungu sangat muda)
export const TINT_EDGE = "#E4DAFB";

// Putih TIDAK ikut dipilih otomatis; cuma muncul kalau lu set cover_color = 'white'
const AUTO: CoverColor[] = ["purple", "pink", "yellow"];

export const hashString = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

/**
 * Warna cover kalau belum ada gambar.
 * - chosen = nilai kolom cover_color di Supabase ('purple' | 'pink' | 'yellow' | 'white')
 * - kalau kosong / salah ketik, dipilih otomatis dari judul (selalu sama untuk judul yang sama)
 */
export function coverSwatch(title: string, chosen?: string | null) {
  const key: CoverColor =
    chosen && chosen in SWATCHES ? (chosen as CoverColor) : AUTO[hashString(title) % AUTO.length];
  return { key, ...SWATCHES[key] };
}
