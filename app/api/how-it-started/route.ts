import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('how_it_started')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found, return default static data as fallback
        return NextResponse.json({
          title: 'How It Started',
          heading: 'A Simple Idea That Ignited a Movement.',
          image_url: '/images/kids3.jpg',
          paragraphs: [
            "Our journey began not in grand tournament halls, but in local communities where potential was abundant but opportunities were scarce. We saw first-hand how the discipline and strategy of chess could captivate young minds and teach them invaluable life skills.",
            "What started with just a handful of chess sets and a few dedicated volunteers quickly grew. As children learned to think ahead on the board, they began to envision brighter futures for themselves. Today, that simple idea has blossomed into a global initiative, transforming thousands of lives one move at a time."
          ],
          stats: [
            { value: "20+", label: "Communities" },
            { value: "10k+", label: "Lives Touched" }
          ]
        });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching how it started content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { title, heading, image_url, paragraphs, stats } = body;

    // We assume the first row exists or we create it.
    const { data: existingData } = await supabase
      .from('how_it_started')
      .select('id')
      .limit(1)
      .single();

    if (existingData) {
      const { data, error } = await supabase
        .from('how_it_started')
        .update({
          title,
          heading,
          image_url,
          paragraphs,
          stats,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('how_it_started')
        .insert({
          title,
          heading,
          image_url,
          paragraphs,
          stats
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating how it started content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
