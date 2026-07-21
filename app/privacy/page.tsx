import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '런포 개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <span className="eyebrow">POLICY</span>
      <h1>개인정보처리방침</h1>
      <section>
        <h2>제1조 (수집하는 개인정보 항목 및 방법)</h2>
        <p>
          런포는 회원가입 없이 이용할 수 있는 서비스로, 서비스 이용 자체를 위해 개인정보를 수집하지
          않습니다. 다만 이용자가 문의를 위해 이메일 등을 직접 보내는 경우, 답변을 위해 필요한
          최소한의 정보가 수집될 수 있습니다.
        </p>
      </section>
      <section>
        <h2>제2조 (개인정보의 수집 및 이용목적)</h2>
        <p>
          수집된 정보는 문의 응대 등 이용자와의 원활한 소통을 위한 목적으로만 이용하며, 명시한 목적
          외의 용도로는 이용하지 않습니다.
        </p>
      </section>
      <section>
        <h2>제3조 (개인정보의 보유 및 이용기간)</h2>
        <p>
          수집된 개인정보는 목적이 달성된 후에는 지체 없이 파기하는 것을 원칙으로 하며, 관계 법령에
          따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.
        </p>
      </section>
      <section>
        <h2>제4조 (개인정보의 제3자 제공)</h2>
        <p>
          런포는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 법령의 근거가 있거나
          이용자가 사전에 동의한 경우에는 예외로 할 수 있습니다.
        </p>
      </section>
      <section>
        <h2>제5조 (쿠키의 운영 및 거부)</h2>
        <p>
          서비스 이용 편의를 높이기 위해 쿠키가 사용될 수 있습니다. 이용자는 브라우저 설정을 통해
          쿠키 저장을 거부할 수 있으며, 이 경우 서비스 이용에 일부 어려움이 있을 수 있습니다.
        </p>
      </section>
      <section>
        <h2>제6조 (이용자의 권리와 행사방법)</h2>
        <p>
          이용자는 언제든지 자신의 개인정보 처리 현황에 대해 열람, 정정, 삭제 등을 문의할 수 있으며,
          아래 연락처를 통해 접수할 수 있습니다.
        </p>
      </section>
      <section>
        <h2>제7조 (문의처)</h2>
        <p>
          문의는 <a href="mailto:runfor365@gmail.com">runfor365@gmail.com</a>로
          보내주시기 바랍니다.
        </p>
      </section>
      <aside>
        이 개인정보처리방침은 법령이나 서비스 내용의 변경에 따라 수정될 수 있으며, 변경 시 이
        페이지를 통해 공지합니다.
      </aside>
    </main>
  )
}
