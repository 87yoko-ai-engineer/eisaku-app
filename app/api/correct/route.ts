import { NextRequest, NextResponse } from 'next/server';
import { correctText } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, tone = 'business', mode = 'free', level = 3, targetGrammar, keywords } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const result = await correctText({ text, tone, mode, level, targetGrammar, keywords });
    return NextResponse.json(result);
  } catch (err) {
    console.error('correction error:', err);
    return NextResponse.json({ error: 'Failed to process correction' }, { status: 500 });
  }
}
