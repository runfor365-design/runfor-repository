'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RaceRow {
  slug: string
  대회명: string
  날짜: string
  지역: string | null
  주최: string | null
  이메일: string | null
  추천여부: boolean
  공개여부: boolean
}

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [races, setRaces] = useState<RaceRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [reviewingSlug, setReviewingSlug] = useState<string | null>(null)

  const fetchRaces = () =>
    createClient()
      .from('races')
      .select('slug, 대회명, 날짜, 지역, 주최, 이메일, 추천여부, 공개여부')
      .order('날짜', { ascending: false })
      .limit(500)

  const loadRaces = async () => {
    const { data } = await fetchRaces()
    setRaces((data as unknown as RaceRow[]) ?? [])
    setListLoading(false)
  }

  useEffect(() => {
    fetchRaces().then(({ data }) => {
      setRaces((data as unknown as RaceRow[]) ?? [])
      setListLoading(false)
    })
  }, [])

  const onLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setUploadMessage(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '업로드 실패')
      setUploadMessage(`${data.count}건 등록/수정 완료`)
      loadRaces()
    } catch (err) {
      setUploadMessage(err instanceof Error ? `오류: ${err.message}` : '업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const toggleRecommend = async (slug: string, next: boolean) => {
    setRaces((prev) => prev.map((race) => (race.slug === slug ? { ...race, 추천여부: next } : race)))
    const res = await fetch('/api/admin/toggle-recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, 추천여부: next }),
    })
    if (!res.ok) {
      setRaces((prev) =>
        prev.map((race) => (race.slug === slug ? { ...race, 추천여부: !next } : race)),
      )
    }
  }

  const review = async (slug: string, action: 'approve' | 'reject') => {
    setReviewingSlug(slug)
    const res = await fetch('/api/admin/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, action }),
    })
    if (res.ok) {
      if (action === 'approve') {
        setRaces((prev) => prev.map((r) => (r.slug === slug ? { ...r, 공개여부: true } : r)))
      } else {
        setRaces((prev) => prev.filter((r) => r.slug !== slug))
      }
    }
    setReviewingSlug(null)
  }

  const pending = races.filter((race) => !race.공개여부)
  const published = races.filter((race) => race.공개여부)
  const filtered = published.filter((race) => race.대회명.toLowerCase().includes(search.toLowerCase()))

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>런포 관리자</h1>
        <div className="admin-header-user">
          <span>{userEmail}</span>
          <button type="button" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>

      {pending.length > 0 && (
        <section className="admin-section admin-pending">
          <h2>승인 대기 중인 신청 ({pending.length})</h2>
          <div className="admin-pending-list">
            {pending.map((race) => (
              <div key={race.slug} className="admin-pending-card">
                <div>
                  <strong>{race.대회명}</strong>
                  <span>
                    {race.날짜} · {race.지역 || '지역 미입력'} · {race.주최 || '주최 미입력'}
                  </span>
                  <span>{race.이메일}</span>
                </div>
                <div className="admin-pending-actions">
                  <button
                    type="button"
                    disabled={reviewingSlug === race.slug}
                    onClick={() => review(race.slug, 'approve')}
                  >
                    승인
                  </button>
                  <button
                    type="button"
                    className="admin-reject"
                    disabled={reviewingSlug === race.slug}
                    onClick={() => review(race.slug, 'reject')}
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="admin-section">
        <h2>대회 JSON 업로드</h2>
        <p>
          slug, 대회명, 날짜는 필수입니다. 같은 slug가 이미 있으면 덮어씁니다(upsert). 그 외 허용
          필드: 집결, 종목배열, 지역, 장소, 주최, 접수시작, 접수마감, 홈페이지, 이메일, 전화,
          소개내용, 상세링크. 업로드된 대회는 바로 공개됩니다.
        </p>
        <input type="file" accept="application/json" onChange={onUpload} disabled={uploading} />
        {uploading && <p>업로드 중...</p>}
        {uploadMessage && <p className="admin-upload-message">{uploadMessage}</p>}
      </section>

      <section className="admin-section">
        <h2>공개된 대회 목록 {!listLoading && `(${published.length})`}</h2>
        <input
          className="admin-search"
          placeholder="대회명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {listLoading ? (
          <p>불러오는 중...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>대회명</th>
                <th>날짜</th>
                <th>추천</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((race) => (
                <tr key={race.slug}>
                  <td>{race.대회명}</td>
                  <td>{race.날짜}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={race.추천여부}
                      onChange={(e) => toggleRecommend(race.slug, e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}
