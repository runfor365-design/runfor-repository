'use client'

import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { AdminRace } from '@/lib/admin-races'

export type EditorMode = 'edit' | 'approve'

interface FieldSpec {
  key: keyof AdminRace
  label: string
  type?: 'date' | 'email' | 'url' | 'textarea'
  required?: boolean
}

const FIELDS: FieldSpec[] = [
  { key: '대회명', label: '대회명', required: true },
  { key: '날짜', label: '대회 날짜', type: 'date', required: true },
  { key: '집결', label: '집결' },
  { key: '지역', label: '지역' },
  { key: '장소', label: '장소' },
  { key: '주최', label: '주최' },
  { key: '접수시작', label: '접수 시작', type: 'date' },
  { key: '접수마감', label: '접수 마감', type: 'date' },
  { key: '홈페이지', label: '홈페이지', type: 'url' },
  { key: '상세링크', label: '상세 링크', type: 'url' },
  { key: '이메일', label: '이메일', type: 'email' },
  { key: '전화', label: '전화' },
  { key: '소개내용', label: '소개 내용', type: 'textarea' },
  { key: '코스설명', label: '코스 설명', type: 'textarea' },
  { key: '난이도', label: '난이도' },
  { key: '팁', label: '준비 팁', type: 'textarea' },
  { key: '후기', label: '후기', type: 'textarea' },
]

export default function RaceEditor({
  race,
  mode,
  onClose,
  onSave,
}: {
  race: AdminRace
  mode: EditorMode
  onClose: () => void
  onSave: (fields: Partial<AdminRace>) => Promise<void>
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map(({ key }) => [key, String(race[key] ?? '')])),
  )
  const [distances, setDistances] = useState(race.종목배열.join(', '))
  const [recommended, setRecommended] = useState(race.추천여부)
  const [hidden, setHidden] = useState(race.숨김여부)
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...values,
      종목배열: distances
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      추천여부: recommended,
      숨김여부: hidden,
      ...(mode === 'approve' ? { 공개여부: true } : {}),
    } as Partial<AdminRace>)
    setSaving(false)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        className="race-modal admin-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-editor-title"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>
        <h2 id="admin-editor-title">{mode === 'approve' ? '수정 후 승인' : '대회 수정'}</h2>
        <p className="admin-editor-slug">slug: {race.slug}</p>

        <div className="admin-editor-grid">
          {FIELDS.map((field) => (
            <label
              key={field.key}
              className={field.type === 'textarea' ? 'admin-editor-wide' : undefined}
            >
              <span>
                {field.label}
                {field.required && ' *'}
              </span>
              {field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={values[field.key]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
              ) : (
                <input
                  type={field.type ?? 'text'}
                  required={field.required}
                  value={values[field.key]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
              )}
            </label>
          ))}
          <label className="admin-editor-wide">
            <span>종목 (쉼표로 구분)</span>
            <input value={distances} onChange={(e) => setDistances(e.target.value)} />
          </label>
        </div>

        <div className="admin-editor-flags">
          <label>
            <input
              type="checkbox"
              checked={recommended}
              onChange={(e) => setRecommended(e.target.checked)}
            />
            추천 대회
          </label>
          <label>
            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
            사이트에서 숨김
          </label>
        </div>

        <div className="admin-editor-actions">
          <button type="button" className="admin-button-ghost" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="admin-button" disabled={saving}>
            {saving ? '저장 중...' : mode === 'approve' ? '저장하고 승인' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
