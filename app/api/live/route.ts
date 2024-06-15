import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('lists').select('id').limit(1);

    if (error) throw new Error('Error while connecting to database');
    return NextResponse.json({
      status: 'ok',
      time: Date.now(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: 'error',
        time: Date.now(),
        message: (e as Error).message || (e as Error).toString(),
      },
      { status: 500 },
    );
  }
}
