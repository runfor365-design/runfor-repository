import type { Metadata } from 'next'

export const metadata: Metadata = { title: '개인정보처리방침', description: '런포 개인정보처리방침' }

export default function PrivacyPage() {
  return <main className="legal-page"><span className="eyebrow">POLICY</span><h1>개인정보처리방침</h1><p className="legal-updated">시행일: 2026년 7월 17일</p><section><h2>1. 수집하는 개인정보</h2><p>런포는 회원가입, 로그인, 게시판 기능을 운영하지 않으며 현재 이용자의 개인정보를 직접 수집하거나 저장하지 않습니다.</p></section><section><h2>2. 자동으로 생성되는 정보</h2><p>서비스 품질 개선과 방문 통계 분석을 위해 쿠키, 접속 기록, 기기 정보가 분석 도구를 통해 처리될 수 있습니다. 광고 서비스를 도입하는 경우 Google을 포함한 제3자 사업자가 쿠키를 사용할 수 있습니다.</p></section><section><h2>3. 외부 서비스와 링크</h2><p>대회 신청, 뉴스, YouTube 콘텐츠는 외부 사이트로 연결됩니다. 해당 사이트에서 이루어지는 개인정보 처리는 각 서비스의 정책을 따릅니다.</p></section><section><h2>4. 문의</h2><p>개인정보 관련 문의는 <a href="mailto:privacy@runfor.kr">privacy@runfor.kr</a>로 보내주시기 바랍니다.</p></section><aside>본 문서는 실제 광고·분석 도구 도입 시 사용 서비스에 맞춰 추가 검토가 필요합니다.</aside></main>
}
