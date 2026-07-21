import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://runfor.kr'),
  title: { default: '런포 RUNFOR | 전국 마라톤 대회 정보', template: '%s | 런포' },
  description:
    '대한민국 마라톤 대회 일정과 지역, 종목, 접수 상태를 지도와 달력으로 한눈에 확인하세요.',
  keywords: ['마라톤 대회', '러닝 대회', '마라톤 일정', '10km', '하프마라톤', '풀코스'],
  openGraph: {
    title: '런포 RUNFOR',
    description: '러너를 위한 전국 마라톤 정보 대시보드',
    type: 'website',
    locale: 'ko_KR',
    siteName: '런포',
  },
  robots: { index: true, follow: true },
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
