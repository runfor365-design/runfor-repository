'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchAllAdminRaces, findDuplicateGroups, type AdminRace } from '@/lib/admin-races'
import PendingTab from './PendingTab'
import RacesTab from './RacesTab'
import DuplicatesTab from './DuplicatesTab'
import UploadTab from './UploadTab'
import RaceEditor, { type EditorMode } from './RaceEditor'

type Tab = 'pending' | 'races' | 'duplicates' | 'upload'

export interface RaceActions {
  /** 일부 필드만 고쳐 저장한다. 성공 여부를 돌려준다. */
  save: (slug: string, fields: Partial<AdminRace>) => Promise<boolean>
  /** 확인 창을 띄운 뒤 완전 삭제한다. */
  remove: (race: AdminRace) => Promise<void>
  edit: (race: AdminRace, mode?: EditorMode) => void
}

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [races, setRaces] = useState<AdminRace[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('pending')
  const [editing, setEditing] = useState<{ race: AdminRace; mode: EditorMode } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const reload = () =>
    fetchAllAdminRaces(createClient())
      .then((rows) => {
        setRaces(rows)
        setLoadError(null)
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    fetchAllAdminRaces(createClient())
      .then(setRaces)
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const flash = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 2500)
  }

  const actions: RaceActions = {
    save: async (slug, fields) => {
      const res = await fetch('/api/admin/races', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, fields }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        flash(`저장 실패: ${data.error ?? res.status}`)
        return false
      }
      setRaces((prev) => prev.map((race) => (race.slug === slug ? { ...race, ...fields } : race)))
      flash('저장했습니다.')
      return true
    },
    remove: async (race) => {
      if (!window.confirm(`"${race.대회명}" (${race.날짜})을(를) 완전히 삭제할까요?\n되돌릴 수 없습니다.`)) {
        return
      }
      const res = await fetch('/api/admin/races', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: race.slug }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        flash(`삭제 실패: ${data.error ?? res.status}`)
        return
      }
      setRaces((prev) => prev.filter((item) => item.slug !== race.slug))
      flash('삭제했습니다.')
    },
    edit: (race, mode = 'edit') => setEditing({ race, mode }),
  }

  const pending = useMemo(() => races.filter((race) => !race.공개여부), [races])
  const published = useMemo(() => races.filter((race) => race.공개여부), [races])
  const duplicateGroups = useMemo(() => findDuplicateGroups(published), [published])

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'pending', label: '승인 대기', count: pending.length },
    { key: 'races', label: '대회 관리', count: published.length },
    { key: 'duplicates', label: '중복 의심', count: duplicateGroups.length },
    { key: 'upload', label: 'JSON 업로드' },
  ]

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>런포 관리자</h1>
        <div className="admin-header-user">
          <span>{userEmail}</span>
          <button
            type="button"
            onClick={async () => {
              await createClient().auth.signOut()
              window.location.href = '/admin/login'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="admin-tabs" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={tab === item.key ? 'active' : ''}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            {item.count !== undefined && <span className="admin-tab-count">{item.count}</span>}
          </button>
        ))}
      </div>

      {notice && <p className="admin-notice">{notice}</p>}
      {loadError && <p className="admin-error">데이터를 불러오지 못했습니다: {loadError}</p>}

      {loading ? (
        <p className="admin-section">불러오는 중...</p>
      ) : (
        <>
          {tab === 'pending' && (
            <PendingTab pending={pending} published={published} actions={actions} />
          )}
          {tab === 'races' && <RacesTab races={published} actions={actions} />}
          {tab === 'duplicates' && <DuplicatesTab groups={duplicateGroups} actions={actions} />}
          {tab === 'upload' && <UploadTab onUploaded={reload} />}
        </>
      )}

      {editing && (
        <RaceEditor
          race={editing.race}
          mode={editing.mode}
          onClose={() => setEditing(null)}
          onSave={async (fields) => {
            const ok = await actions.save(editing.race.slug, fields)
            if (ok) setEditing(null)
          }}
        />
      )}
    </main>
  )
}
