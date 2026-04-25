import { NextRequest, NextResponse } from 'next/server';
import { chatWithContext } from '@/lib/claude';
import type { ChatMessage } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, correctionContext } = body as { messages: ChatMessage[]; correctionContext: string };

    if (!messages?.length || !correctionContext) {
      return NextResponse.json({ error: 'messages and correctionContext are required' }, { status: 400 });
    }

    const reply = await chatWithContext({ messages, correctionContext });
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('chat error:', err);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
