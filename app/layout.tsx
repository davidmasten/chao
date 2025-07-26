import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: '吵架包赢 - AI助力，让你在每次争论中都能占据上风',
  description: '使用先进的AI技术，为你生成犀利有力的回复，让你在任何争论中都能占据上风。支持调节语气强烈程度，提供多种回复风格。',
  keywords: ['吵架', '辩论', 'AI', '回复', '争论', '反驳', '沟通技巧'],
  authors: [{ name: '吵架包赢团队' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#059669',
  openGraph: {
    title: '吵架包赢 - AI助力争论神器',
    description: '智能生成犀利回复，让你的每句话都有理有据',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
