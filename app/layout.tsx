import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

const SITE_DESCRIPTION =
  '전국 마라톤, 러닝 대회 일정을 지역·종목·접수 상태로 검색하고 지도와 달력으로 한눈에 확인하세요. 5km, 10km, 하프마라톤, 풀코스 등 대회 정보와 접수 기간을 무료로 제공합니다.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://runfor.kr'),
  title: { default: '런포 RUNFOR | 전국 마라톤 대회 정보', template: '%s | 런포' },
  description: SITE_DESCRIPTION,
  keywords: [
    '마라톤 대회',
    '러닝 대회',
    '마라톤 일정',
    '마라톤 캘린더',
    '전국 마라톤',
    '접수중 마라톤',
    '주말 마라톤',
    '10km 대회',
    '하프마라톤',
    '풀코스 마라톤',
    '지역 마라톤 대회',
    '러닝 캘린더',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: '런포 RUNFOR | 전국 마라톤 대회 정보',
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'ko_KR',
    siteName: '런포',
    url: '/',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '런포 RUNFOR' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '런포 RUNFOR | 전국 마라톤 대회 정보',
    description: SITE_DESCRIPTION,
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
  verification: {
    google: '1pqphrY3FNAol1JrXYqmqzXcR88nNtyNjMVpBE2I-a8',
    other: { 'naver-site-verification': '82d64ddcdecf3ca773b4b5bfc3460ee500c99b88' },
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기
        </a>
        <Header />
        <div id="main-content">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
