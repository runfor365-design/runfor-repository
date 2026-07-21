import Link from 'next/link'
import { Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="런포 홈">
          <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#132a39" />
            <circle cx="28" cy="32" r="15" fill="none" stroke="#fff" strokeWidth="6" />
            <path d="M38 18h15M42 27h11" stroke="#ff5b35" strokeWidth="6" strokeLinecap="round" />
            <circle cx="28" cy="32" r="4" fill="#ff5b35" />
          </svg>
          <span className="brand-copy">
            <strong>RUNFOR</strong>
            <small>RUNNING INFORMATION</small>
          </span>
        </Link>
        <div className="header-utility">
          <nav className="primary-nav" aria-label="주요 메뉴">
            <Link href="/#races">대회 일정</Link>
            <Link href="/#running-feed">최신 콘텐츠</Link>
          </nav>
          <button className="menu-button" type="button" aria-label="메뉴 열기">
            <Menu size={21} />
          </button>
        </div>
      </div>
    </header>
  )
}
