import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarRange, Map, Newspaper, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: '런포 소개',
  description: '달릴 이유와 다음 출발선을 연결하는 마라톤 정보 서비스 런포를 소개합니다.',
}

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="eyebrow light">RUNFOR</span>
        <h1>
          러너들을 위한
          <br />
          대회 정보와 최신 콘텐츠
        </h1>
        <p>RUNFOR는 Running Information과 ‘러너를 위한’의 뜻을 함께 담았습니다.</p>
      </section>
      <section className="about-body">
        <div className="about-features">
          <article>
            <CalendarRange />
            <strong>달력으로 찾기</strong>
            <p>대회 달력으로 접수중 · 접수예정 · 마감 상태를 구분해 한눈에 확인합니다.</p>
          </article>
          <article>
            <Map />
            <strong>지도로 찾기</strong>
            <p>전국 17개 시·도 지도에서 그 지역 대회를 확인해 보세요.</p>
          </article>
          <article>
            <Newspaper />
            <strong>최신 콘텐츠</strong>
            <p>러너들을 위한 소식과 영상을 매번 새롭게 보여줍니다.</p>
          </article>
          <article>
            <ShieldCheck />
            <strong>확인 가능한 정보</strong>
            <p>신청 전 공식 주최 측 정보를 다시 확인하도록 상세 페이지에서 명확히 안내합니다.</p>
          </article>
        </div>
        <div className="about-cta">
          <div>
            <strong>당신의 다음 목표는 어디인가요?</strong>
            <p>전국의 대회를 지금 살펴보세요.</p>
          </div>
          <Link href="/#races">대회 찾기</Link>
        </div>
      </section>
    </main>
  )
}
