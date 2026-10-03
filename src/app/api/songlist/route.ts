import { createServerClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import type { SongCategory } from '@/types/database';

/**
 * GET /api/songlist?month_year=YYYY-MM
 * Returns all songs for the given month, ordered by order_index.
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
    .from('songlists')
    .select('*')
    .eq('month_year', month_year)
    .order('order_index');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data }, { status: 200 });
}

/**
 * POST /api/songlist
 * Replaces the entire songlist for a month.
 * Deletes existing songs for the month, then inserts the new list.
 *
 * Body: {
 *   songs: Array<{
 *     id?: string
 *     month_year: string
 *     weekend_dates: string
 *     song_title: string
 *     song_by: string
 *     category: SongCategory
 *     sequencer_key: string
 *     suggested_key_male: string
 *     suggested_key_female: string
 *     order_index: number
 *     is_highlighted: boolean
 *   }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { songs } = body;

    if (!Array.isArray(songs) || songs.length === 0) {
      return Response.json(
        { error: 'songs array is required and must not be empty.' },
        { status: 400 }
      );
    }

    const month_year: string = songs[0].month_year;
    if (!month_year) {
      return Response.json(
        { error: 'Each song must have a month_year.' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Delete all existing songs for this month
    const { error: deleteError } = await supabase
      .from('songlists')
      .delete()
      .eq('month_year', month_year);

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert the new list (strip id so Supabase generates new UUIDs)
    const toInsert = songs.map(
      (
        song: {
          month_year: string;
          weekend_dates: string;
          song_title: string;
          song_by: string;
          category: SongCategory;
          sequencer_key: string;
          suggested_key_male: string;
          suggested_key_female: string;
          order_index: number;
          is_highlighted: boolean;
        },
        index: number
      ) => ({
        month_year: song.month_year,
        weekend_dates: song.weekend_dates,
        song_title: song.song_title,
        song_by: song.song_by,
        category: song.category,
        sequencer_key: song.sequencer_key,
        suggested_key_male: song.suggested_key_male,
        suggested_key_female: song.suggested_key_female,
        order_index: index,
        is_highlighted: song.is_highlighted ?? false,
      })
    );

    const { data, error: insertError } = await supabase
      .from('songlists')
      .insert(toInsert)
      .select();

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    return Response.json(
      { data, message: 'Songlist berhasil disimpan.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[songlist POST] Unexpected error', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

/**
 * DELETE /api/songlist?id=<song_id>
 * Deletes a single song by id.
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'id is required.' }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from('songlists').delete().eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: 'Song deleted.' }, { status: 200 });
}

/**
 * PATCH /api/songlist
 * Updates a single song by id.
 *
 * Body: { id: string; [field]: value }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return Response.json({ error: 'id is required.' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('songlists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data }, { status: 200 });
  } catch (err) {
    console.error('[songlist PATCH] Unexpected error', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
