import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 招待コードページとその認証APIは素通り
  if (pathname.startsWith('/invite') || pathname.startsWith('/api/invite')) {
    return NextResponse.next();
  }

  // admin（オーナー）または trial（一般ユーザー）のクッキーがあれば通過
  const access = request.cookies.get('eisaku_access')?.value;
  if (access === 'admin' || access === 'trial') {
    return NextResponse.next();
  }

  // なければ招待コードページへリダイレクト
  return NextResponse.redirect(new URL('/invite', request.url));
}

export const config = {
  // 静的ファイル・画像・faviconはチェックしない
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
