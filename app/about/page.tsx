import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarRange, Map, Newspaper, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = { title: '런포 소개', description: '달릴 이유와 다음 출발선을 연결하는 마라톤 정보 서비스 런포를 소개합니다.' }

export default function AboutPage() {
  return <main className="about-page"><section className="about-hero"><span className="eyebrow light">WHY RUNFOR</span><h1>달릴 이유는 달라도,<br />필요한 정보는 선명하게.</h1><p>RUNFOR는 Running Information과 ‘러너를 위해 달린다’는 뜻을 함께 담았습니다.</p></section><section className="about-body"><div className="about-statement"><span>01</span><h2>정보를 찾는 시간보다<br />달리는 시간이 길어지도록.</h2><p>흩어진 전국 대회 일정을 지도와 달력, 목록으로 연결합니다. 복잡한 가입 없이 누구나 빠르게 다음 대회를 찾을 수 있습니다.</p></div><div className="about-features"><article><Map /><strong>지역 중심 탐색</strong><p>대한민국 시·도 지도를 누르면 관련 일정이 함께 바뀝니다.</p></article><article><CalendarRange /><strong>일정 중심 탐색</strong><p>월간 달력에서 대회와 접수 상태를 한눈에 봅니다.</p></article><article><Newspaper /><strong>가벼운 콘텐츠 연결</strong><p>뉴스와 영상은 원문을 존중하는 RSS 방식으로 제공합니다.</p></article><article><ShieldCheck /><strong>확인 가능한 정보</strong><p>신청 전 공식 주최 측 정보를 확인하도록 명확히 안내합니다.</p></article></div><div className="about-cta"><div><strong>당신의 다음 출발선은 어디인가요?</strong><p>전국의 대회를 지금 살펴보세요.</p></div><Link href="/#races">대회 찾기</Link></div></section></main>
}
