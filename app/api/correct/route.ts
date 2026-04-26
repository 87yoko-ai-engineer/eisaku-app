import { NextRequest, NextResponse } from 'next/server';
import { correctText } from '@/lib/claude';

const TRIAL_LIMIT = parseInt(process.env.TRIAL_LIMIT ?? '10', 10);

export async function POST(req: NextRequest) {
  try {
    const access = req.cookies.get('eisaku_access')?.value;

    if (!access || (access !== 'admin' && access !== 'trial')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let currentUsage = 0;
    if (access === 'trial') {
      currentUsage = parseInt(req.cookies.get('eisaku_usage')?.value ?? '0', 10);
      if (currentUsage >= TRIAL_LIMIT) {
        return NextResponse.json(
          { error: 'trial_limit_exceeded', limit: TRIAL_LIMIT, used: currentUsage },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { text, tone = 'business', mode = 'free', level = 3, targetGrammar, keywords } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const result = await correctText({ text, tone, mode, level, targetGrammar, keywords });
    const response = NextResponse.json(result);

    if (access === 'trial') {
      response.cookies.set('eisaku_usage', String(currentUsage + 1), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('correction error:', err);
    return NextResponse.json({ error: 'Failed to process correction' }, { status: 500 });
  }
}
