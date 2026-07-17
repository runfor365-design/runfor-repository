import Link from 'next/link'
import { CalendarDays, Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="런포 홈">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy"><strong>RUNFOR</strong><small>러너를 위한 정보</small></span>
        </Link>
        <nav className="primary-nav" aria-label="주요 메뉴">
          <Link href="/#races">대회 찾기</Link>
          <Link href="/#calendar">대회 달력</Link>
          <Link href="/#running-feed">러닝 소식</Link>
          <Link href="/about">런포 소개</Link>
        </nav>
        <div className="header-utility">
          <a className="schedule-link" href="#calendar"><CalendarDays size={16} /> 2026 일정</a>
          <button className="menu-button" type="button" aria-label="메뉴 열기"><Menu size={21} /></button>
        </div>
      </div>
    </header>
  )
}
