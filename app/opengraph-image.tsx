import { ImageResponse } from 'next/og'

export const alt = '런포 RUNFOR - 전국 마라톤·러닝 대회 정보'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background: '#132a39',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              width: 60,
              height: 60,
              borderRadius: 16,
              background: '#ff5b35',
            }}
          />
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            RUNFOR 런포
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: 44, fontSize: 60, fontWeight: 800, lineHeight: 1.28 }}>
          전국 마라톤·러닝 대회 정보
        </div>
        <div style={{ display: 'flex', marginTop: 22, fontSize: 30, color: '#9bcbbd' }}>
          지도와 달력으로 한눈에 보는 대회 일정과 접수 현황
        </div>
      </div>
    ),
    { ...size },
  )
}
