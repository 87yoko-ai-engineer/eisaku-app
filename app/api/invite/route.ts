import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  const ownerCode = process.env.INVITE_CODE_OWNER?.trim();
  const trialCode = process.env.INVITE_CODE_TRIAL?.trim();

  let role: 'admin' | 'trial' | null = null;
  if (code && code === ownerCode) role = 'admin';
  else if (code && code === trialCode) role = 'trial';

  if (!role) {
    return NextResponse.json({ error: 'コードが正しくありません' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  };

  response.cookies.set('eisaku_access', role, cookieOptions);

  if (role === 'trial') {
    // 既存カウンターがなければ 0 で初期化
    const existing = request.cookies.get('eisaku_usage')?.value;
    if (!existing) {
      response.cookies.set('eisaku_usage', '0', cookieOptions);
    }
  }

  return response;
}
