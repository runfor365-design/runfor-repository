import DashboardClient from '@/components/DashboardClient'
import { getRaces } from '@/lib/races'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://runfor.kr'

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
