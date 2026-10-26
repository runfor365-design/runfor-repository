'use client'

import { useState, type ChangeEvent } from 'react'

export default function UploadTab({ onUploaded }: { onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setMessage(null)
    try {
      const json = JSON.parse(await file.text())
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '업로드 실패')
      setMessage(`${data.count}건 등록/수정 완료`)
      onUploaded()
    } catch (err) {
      setMessage(err instanceof Error ? `오류: ${err.message}` : '업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="admin-section">
      <p>
        slug, 대회명, 날짜는 필수입니다. 같은 slug가 이미 있으면 기본 정보만 덮어쓰고, 추천·숨김·승인 상태는
        그대로 유지합니다. 그 외 허용 필드: 집결, 종목배열, 지역, 장소, 주최, 접수시작, 접수마감, 홈페이지,
        이메일, 전화, 소개내용, 상세링크. 새로 추가된 대회는 바로 공개됩니다.
      </p>
      <input type="file" accept="application/json" onChange={onUpload} disabled={uploading} />
      {uploading && <p>업로드 중...</p>}
      {message && <p className="admin-upload-message">{message}</p>}
    </section>
  )
}
