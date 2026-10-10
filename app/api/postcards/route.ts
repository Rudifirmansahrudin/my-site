import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Menggunakan SERVICE_ROLE_KEY agar bisa bypass RLS saat Insert data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, name, url, email, stampImg } = body;

    // 1. Validasi Dasar
    if (!message || message.length > 500 || !name) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    // 2. Ambil Negara dari Vercel Headers (Jika ada)
    const country = req.headers.get('x-vercel-ip-country') || 'ID';

    // 3. Upload Gambar Prangko ke Storage
    let stamp_path = null;
    if (stampImg) {
      const base64Data = stampImg.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `stamp_${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('stamps')
        .upload(fileName, buffer, { contentType: 'image/png' });

      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage.from('stamps').getPublicUrl(fileName);
      stamp_path = publicUrlData.publicUrl;
    }

    // 4. Simpan Data ke Tabel (Otomatis status 'pending')
    const { error: dbError } = await supabase
      .from('postcards')
      .insert([{ message, name, url, email, stamp_path, country }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}