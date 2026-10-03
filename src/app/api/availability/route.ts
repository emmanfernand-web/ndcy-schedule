import { createServerClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

/**
 * POST /api/availability
 * Upserts an availability record for a given member + month_year.
 * Uses ON CONFLICT (member_id, month_year) DO UPDATE to prevent duplicates.
 *
 * Body: {
 *   member_id: string
 *   month_year: string  // 'YYYY-MM'
 *   cp_dates: string[]
 *   lw_dates: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_id, month_year, cp_dates, lw_dates } = body;

    if (!member_id || !month_year) {
      return Response.json(
        { error: 'member_id dan month_year wajib diisi.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(cp_dates) || !Array.isArray(lw_dates)) {
      return Response.json(
        { error: 'cp_dates dan lw_dates harus berupa array.' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Upsert — relies on unique constraint (member_id, month_year)
    const { data, error } = await supabase
      .from('availabilities')
      .upsert(
        {
          member_id,
          month_year,
          cp_dates,
          lw_dates,
        },
        {
          onConflict: 'member_id,month_year',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[availability POST]', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      { data, message: 'Ketersediaan berhasil disimpan.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[availability POST] Unexpected error', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * GET /api/availability?month_year=YYYY-MM
 * Returns all availabilities for the given month.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month_year = searchParams.get('month_year');

  if (!month_year) {
    return Response.json(
      { error: 'month_year query param is required.' },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('availabilities')
    .select('*, members(id, name, role)')
    .eq('month_year', month_year);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data }, { status: 200 });
}
