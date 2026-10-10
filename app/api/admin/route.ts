// app/api/admin/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SERVICE_ROLE_KEY || 'dummy-key'
);

export async function POST(req: Request) {
  try {
    const { action, id, password } = await req.json();

    // Verifikasi password dari .env.local
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Password salah!" }, { status: 401 });
    }

    // Ambil daftar kartu yang masih 'pending'
    if (action === "GET_PENDING") {
      const { data, error } = await supabase
        .from('postcards')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data);
    }

    // Eksekusi Approve atau Reject
    if (action === "APPROVE" || action === "REJECT") {
      const newStatus = action === "APPROVE" ? "approved" : "rejected";
      const { error } = await supabase
        .from('postcards')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}