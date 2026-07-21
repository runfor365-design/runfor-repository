export type RegistrationStatus = '접수중' | '접수예정' | '접수마감'

/** data/races.json의 원본 수집 데이터 형태 (marathongo 스키마) */
export interface RawRace {
  id: number
  대회명: string
  slug: string
  날짜: string
  집결: string
  종목: string
  종목배열: string[]
  지역: string
  지역대분류: string
  장소: string
  주최: string
  접수시작: string
  접수마감: string
  접수상태: string
  홈페이지: string
  이메일: string
  전화: string
  소개내용: string
  품절여부: boolean | number | null
  중단여부: boolean | number | null
  상세링크: string
  이미지: string
}

export interface RaceExtra {
  slug: string
  코스설명?: string
  난이도?: string
  후기?: string
  팁?: string
  /** true면 추천 대회 영역에 노출 후보로 포함 (여러 건이면 무작위 노출) */
  추천여부?: boolean
}

/** 화면과 상세 페이지에서 사용하는 정규화된 대회 데이터 */
export interface NormalizedRace {
  대회명: string
  slug: string
  종목: string[]
  장소: string
  장소상세: string
  집결시간: string
  집결정보: string
  주최?: string
  접수상태: RegistrationStatus | string
  접수기간: string
  상세링크: string
  신청링크?: string
  문의이메일?: string
  문의전화?: string
  소개내용?: string
  이미지?: string
  date: string
  region: string
  status: RegistrationStatus
  extra?: RaceExtra
}

export interface FeedItem {
  title: string
  link: string
  publishedAt: string
  source: string
  thumbnail?: string
}
