import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { month_year, assignments } = body;

    if (!month_year) {
      return NextResponse.json(
        { error: 'month_year wajib diisi' },
        { status: 400 }
      );
    }

    // 1. Ambil seluruh event ID untuk bulan ini
    const { data: events, error: eventError } = await supabase
      .from('schedule_events')
      .select('id')
      .eq('month_year', month_year);

    if (eventError) throw eventError;

    const eventIds = events.map((e) => e.id);

    // 2. Hapus penugasan lama untuk event bulan ini agar tidak ada duplikasi
    if (eventIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('schedule_assignments')
        .delete()
        .in('event_id', eventIds);

      if (deleteError) throw deleteError;
    }

    // 3. Masukkan penugasan baru jika ada
    if (assignments && assignments.length > 0) {
      const { error: insertError } = await supabase
        .from('schedule_assignments')
        .insert(assignments);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in POST /api/schedule:', err);
    return NextResponse.json(
      { error: err.message ?? 'Gagal menyimpan jadwal.' },
      { status: 500 }
    );
  }
}