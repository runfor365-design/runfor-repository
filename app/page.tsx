import type { Metadata } from 'next'
import DashboardClient from '@/components/DashboardClient'
import { getRaces } from '@/lib/races'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://runfor.kr'
const YEAR = new Date().getFullYear()
const HOME_TITLE = `${YEAR} 전국 마라톤 대회 일정·접수 정보 | 런포 RUNFOR`
const HOME_DESCRIPTION = `${YEAR}년 전국 마라톤·러닝 대회 일정을 확인하세요. 지역, 종목, 접수 상태별 일정과 지도·달력, 공식 신청 정보를 제공합니다.`

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: '런포 RUNFOR',
      alternateName: 'RUNFOR',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description: '대한민국 마라톤·러닝 대회 정보를 지도와 달력으로 제공하는 서비스',
    },
    {
      '@type': 'WebSite',
      name: '런포 RUNFOR',
      url: SITE_URL,
      inLanguage: 'ko-KR',
      description:
        '전국 마라톤, 러닝 대회 일정을 지역·종목·접수 상태로 검색하고 지도와 달력으로 확인할 수 있는 대회 정보 서비스',
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DashboardClient races={getRaces()} />
    </>
  )
}
