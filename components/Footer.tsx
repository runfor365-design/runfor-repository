import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer"><div className="footer-inner"><div><strong>RUNFOR</strong><p>달릴 이유와 다음 출발선을 연결합니다.</p></div><nav aria-label="하단 메뉴"><Link href="/about">서비스 소개</Link><Link href="/privacy">개인정보처리방침</Link><a href="mailto:hello@runfor.kr">문의하기</a></nav><small>© 2026 RUNFOR. Race information is subject to change.</small></div></footer>
  )
}
