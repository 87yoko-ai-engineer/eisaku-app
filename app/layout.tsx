import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP, M_PLUS_Rounded_1c } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { UserProgressProvider } from '@/contexts/UserProgressContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto', weight: ['300', '400', '500', '600', '700'] });
const mPlusRounded = M_PLUS_Rounded_1c({ subsets: ['latin'], variable: '--font-rounded', weight: ['700', '800'] });

export const metadata: Metadata = {
  title: 'EiSaku — 英作文添削',
  description: 'あなた専用の英作文コーチ。文法・語彙・文体・構成まで、多角的にフィードバック。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable} ${mPlusRounded.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <UserProgressProvider>
          <Nav />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </UserProgressProvider>
      </body>
    </html>
  );
}
