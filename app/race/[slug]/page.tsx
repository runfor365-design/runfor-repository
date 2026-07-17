import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Clock3, Mail, MapPin, Phone, Route, Sparkles, TriangleAlert } from 'lucide-react'
import { formatKoreanDate } from '@/lib/date'
import { getRace, getRaces } from '@/lib/races'
import { shortRegionName } from '@/lib/region-map'

export function generateStaticParams() { return getRaces().map((race) => ({ slug: race.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const race = getRace(slug)
  if (!race) return { title: '대회를 찾을 수 없습니다' }
  return { title: race.대회명, description: `${formatKoreanDate(race.date)} ${race.장소}에서 열리는 ${race.대회명} 일정, 종목, 접수 정보를 확인하세요.`, openGraph: { title: race.대회명, description: `${race.장소} · ${race.종목.join(', ')}`, type: 'article' } }
}

export default async function RaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const race = getRace(slug)
  if (!race) notFound()
  const officialLink = race.신청링크 || race.상세링크
  const isSample = officialLink.includes('example.com')
  return <main className="race-detail-page">
    <div className="detail-top"><Link href="/#races"><ArrowLeft size={16} /> 대회 목록</Link><span>RACE DETAIL / 2026</span></div>
    <header className="detail-hero"><div className="detail-title"><div><span className={`status-badge status-${race.status}`}>{race.status}</span><span className="detail-region">{shortRegionName(race.region)}</span></div><h1>{race.대회명}</h1><p>{race.소개내용 || '대회의 주요 일정과 참가 정보를 확인하세요.'}</p></div><div className="detail-date"><span>{new Date(`${race.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span><strong>{new Date(`${race.date}T00:00:00`).getDate()}</strong><small>{new Date(`${race.date}T00:00:00`).toLocaleDateString('ko-KR', { weekday: 'long' })}</small></div></header>
    <div className="detail-grid"><section className="detail-main">
      <article className="detail-facts"><h2>대회 기본 정보</h2><dl><div><dt><CalendarDays />일정</dt><dd>{formatKoreanDate(race.date)}</dd></div><div><dt><Clock3 />집결</dt><dd>{race.집결정보 || race.집결시간}</dd></div><div><dt><MapPin />장소</dt><dd>{race.장소상세 || race.장소}</dd></div><div><dt><Route />종목</dt><dd>{race.종목.join(' · ')}</dd></div></dl></article>
      <article className="editorial-block"><span className="eyebrow">RUNFOR NOTE</span><h2>러너를 위한 코스 노트</h2>{race.extra ? <div className="note-grid"><div><span>코스</span><p>{race.extra.코스설명 || '상세 코스 정보는 공식 요강을 확인해 주세요.'}</p></div><div><span>난이도</span><strong>{race.extra.난이도 || '정보 준비 중'}</strong></div><div className="note-tip"><span><Sparkles size={15} /> 준비 팁</span><p>{race.extra.팁 || '대회 전날 장비와 이동 동선을 미리 확인하세요.'}</p></div></div> : <div className="note-empty">고유 코스 리뷰와 준비 팁을 작성 중입니다.</div>}</article>
      <article className="registration-info"><h2>접수 안내</h2><div><span>접수 기간</span><strong>{race.접수기간}</strong></div><p><TriangleAlert size={16} /> 일정, 코스, 참가비는 주최 측 사정으로 변경될 수 있습니다. 신청 전 공식 정보를 확인하세요.</p></article>
    </section>
    <aside className="detail-aside"><div className="apply-card"><span className="eyebrow light">ENTRY INFORMATION</span><h2>출발선에 설 준비가<br />되셨나요?</h2><ul><li><Check /> 접수 상태 <strong>{race.status}</strong></li><li><Check /> 참가 종목 <strong>{race.종목.length}개</strong></li><li><Check /> 개최 지역 <strong>{shortRegionName(race.region)}</strong></li></ul>{isSample ? <button disabled>공식 링크 준비 중</button> : <a href={officialLink} target="_blank" rel="nofollow noopener">공식 페이지에서 신청 <ArrowUpRight size={17} /></a>}<small>외부 주최 측 사이트로 이동합니다.</small></div>{(race.문의전화 || race.문의이메일) && <div className="contact-card"><h3>주최 측 문의</h3>{race.문의전화 && <a href={`tel:${race.문의전화}`}><Phone />{race.문의전화}</a>}{race.문의이메일 && <a href={`mailto:${race.문의이메일}`}><Mail />{race.문의이메일}</a>}</div>}</aside></div>
  </main>
}
