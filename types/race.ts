export type RegistrationStatus = '접수중' | '접수예정' | '접수마감'

export interface Race {
  대회명: string
  날짜: string
  종목: string[]
  지역: string
  장소: string
  집결시간: string
  접수상태: RegistrationStatus | string
  접수기간: string
  설명원문: string
  상세링크: string
  slug: string
  신청링크?: string
  날짜_정확?: string
  장소상세?: string
  집결정보?: string
  문의이메일?: string
  문의전화?: string
  소개내용?: string
  이미지?: string
}

export interface RaceExtra {
  slug: string
  코스설명?: string
  난이도?: string
  후기?: string
  팁?: string
  추천여부?: boolean
}

export interface NormalizedRace extends Race {
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
