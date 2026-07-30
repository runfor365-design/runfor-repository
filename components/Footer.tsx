'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Loader2, Mail, Send, X } from 'lucide-react'

const CONTACT_EMAIL = 'runfor365@gmail.com'

const GATHER_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const minutes = i * 30
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m} 집결`
})
const DISTANCE_OPTIONS = ['5km', '10km', '15km', '하프', '30km', '풀']
const DISTANCE_OTHER = '그외'
const REGION_OPTIONS = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
]

interface RaceField {
  key: string
  label: string
  type?: string
  placeholder?: string
  textarea?: boolean
  options?: string[]
  multi?: boolean
}

const RACE_FIELDS: RaceField[] = [
  { key: '대회명', label: '대회명', placeholder: '새해 일출 마라톤' },
  { key: '날짜', label: '날짜', type: 'date' },
  { key: '집결', label: '집결시간', options: GATHER_OPTIONS },
  { key: '종목', label: '종목', options: DISTANCE_OPTIONS, multi: true },
  { key: '지역', label: '지역', options: REGION_OPTIONS },
  { key: '장소', label: '장소', placeholder: '육상트랙구장' },
  { key: '주최', label: '주최', placeholder: '(사)대한생활체육협회' },
  { key: '접수시작', label: '접수시작', type: 'date' },
  { key: '접수마감', label: '접수마감', type: 'date' },
  { key: '홈페이지', label: '홈페이지', placeholder: 'https://...' },
  { key: '이메일', label: '주최 측 문의 이메일', type: 'email' },
  { key: '전화', label: '전화', placeholder: '1234-5678' },
  { key: '소개내용', label: '소개내용', textarea: true },
]

type SubmitState = 'idle' | 'submitting' | 'done' | 'error'

export default function Footer() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<'race' | 'other' | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [distanceSelected, setDistanceSelected] = useState<string[]>([])
  const [customDistance, setCustomDistance] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [emailCopied, setEmailCopied] = useState(false)

  const setField = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }))
  const syncDistance = (selected: string[], custom: string) => {
    const value = [
      ...selected.filter((option) => option !== DISTANCE_OTHER),
      ...(selected.includes(DISTANCE_OTHER) && custom.trim() ? [custom.trim()] : []),
    ].join(',')
    setField('종목', value)
  }
  const toggleDistance = (option: string) => {
    setDistanceSelected((prev) => {
      const next = prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
      syncDistance(next, customDistance)
      return next
    })
  }
  const onCustomDistanceChange = (text: string) => {
    setCustomDistance(text)
    syncDistance(distanceSelected, text)
  }
  const allFilled = RACE_FIELDS.every((field) => values[field.key]?.trim())

  const closeModal = () => {
    setOpen(false)
    setCategory(null)
    setValues({})
    setDistanceSelected([])
    setCustomDistance('')
    setSubmitState('idle')
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 1500)
    })
  }

  const submitRaceForm = () => {
    setSubmitState('submitting')
    const payload: Record<string, string> = {}
    RACE_FIELDS.forEach((field) => {
      payload[field.key] = values[field.key].trim()
    })
    fetch('/api/apply-race', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('submit failed')
        setSubmitState('done')
      })
      .catch(() => setSubmitState('error'))
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <strong>RUNFOR</strong>
          <p>러너들을 위한 대회 정보와 최신 콘텐츠</p>
        </div>
        <nav aria-label="하단 메뉴">
          <Link href="/about">서비스 소개</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <button type="button" onClick={() => setOpen(true)}>
            문의하기
          </button>
        </nav>
        <small>© {new Date().getFullYear()} RUNFOR. Race information is subject to change.</small>
      </div>

      {open && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section
            className="race-modal contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal} aria-label="닫기">
              <X size={20} />
            </button>
            <h2 id="contact-title">문의하기</h2>
            <p className="contact-email">
              <Mail size={15} />
              연락 가능한 이메일 <strong>{CONTACT_EMAIL}</strong>
            </p>

            <div className="view-toggle contact-tabs" role="tablist" aria-label="문의 카테고리">
              <button
                type="button"
                role="tab"
                aria-selected={category === 'race'}
                className={category === 'race' ? 'active' : ''}
                onClick={() => setCategory('race')}
              >
                대회관련
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={category === 'other'}
                className={category === 'other' ? 'active' : ''}
                onClick={() => setCategory('other')}
              >
                그 외
              </button>
            </div>

            {!category && <p className="contact-hint">문의 종류를 먼저 선택해 주세요.</p>}

            {category === 'race' &&
              (submitState === 'done' ? (
                <div className="contact-panel">
                  <p>신청이 접수되었습니다. 관리자 검토 후 승인되면 사이트에 노출됩니다.</p>
                </div>
              ) : (
                <div className="contact-panel">
                  <p>
                    대회 등록을 원하시면 아래 내용을 모두 입력해 주세요. 제출 후 관리자 검토를 거쳐
                    승인되면 사이트에 노출됩니다.
                  </p>
                  <div className="contact-form">
                    {RACE_FIELDS.map((field) => {
                      if (field.multi && field.options) {
                        return (
                          <div
                            key={field.key}
                            className="contact-form-row contact-form-row-wide"
                            role="group"
                            aria-label={field.label}
                          >
                            <span>{field.label}</span>
                            <div className="contact-chip-group">
                              {[...field.options, DISTANCE_OTHER].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  className={distanceSelected.includes(option) ? 'active' : ''}
                                  onClick={() => toggleDistance(option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                            {distanceSelected.includes(DISTANCE_OTHER) && (
                              <input
                                className="contact-distance-other"
                                type="text"
                                placeholder="직접 입력 (예: 3km 걷기부문)"
                                value={customDistance}
                                onChange={(e) => onCustomDistanceChange(e.target.value)}
                              />
                            )}
                          </div>
                        )
                      }
                      if (field.options) {
                        return (
                          <label key={field.key} className="contact-form-row">
                            <span>{field.label}</span>
                            <select
                              value={values[field.key] ?? ''}
                              onChange={(e) => setField(field.key, e.target.value)}
                            >
                              <option value="" disabled>
                                선택해 주세요
                              </option>
                              {field.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                        )
                      }
                      if (field.textarea) {
                        return (
                          <label key={field.key} className="contact-form-row contact-form-row-wide">
                            <span>{field.label}</span>
                            <textarea
                              rows={3}
                              placeholder={field.placeholder}
                              value={values[field.key] ?? ''}
                              onChange={(e) => setField(field.key, e.target.value)}
                            />
                          </label>
                        )
                      }
                      return (
                        <label key={field.key} className="contact-form-row">
                          <span>{field.label}</span>
                          <input
                            type={field.type ?? 'text'}
                            placeholder={field.placeholder}
                            value={values[field.key] ?? ''}
                            onChange={(e) => setField(field.key, e.target.value)}
                          />
                        </label>
                      )
                    })}
                  </div>
                  {submitState === 'error' && (
                    <p className="contact-error">
                      전송 중 문제가 발생했습니다. 다시 시도하거나 이메일로 보내주세요.
                    </p>
                  )}
                  <button
                    type="button"
                    className={`contact-send${allFilled ? '' : ' disabled'}`}
                    disabled={!allFilled || submitState === 'submitting'}
                    onClick={submitRaceForm}
                  >
                    {submitState === 'submitting' ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {submitState === 'submitting' ? '전송 중...' : '등록 신청하기'}
                  </button>
                </div>
              ))}

            {category === 'other' && (
              <div className="contact-panel">
                <p>대회 등록 외의 문의는 형식에 구애받지 않고 자유롭게 작성해서 이메일로 보내주세요.</p>
                <button type="button" className="contact-send" onClick={copyEmail}>
                  {emailCopied ? <Check size={16} /> : <Copy size={16} />}
                  {emailCopied ? '이메일 복사됨' : '이메일 복사하기'}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </footer>
  )
}
