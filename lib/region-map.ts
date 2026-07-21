const aliases: Record<string, string> = {
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원도',
  강원도: '강원도',
  강원특별자치도: '강원도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전라북도',
  전북특별자치도: '전라북도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
}

export const shortRegionName = (region: string) =>
  ({
    서울특별시: '서울',
    부산광역시: '부산',
    대구광역시: '대구',
    인천광역시: '인천',
    광주광역시: '광주',
    대전광역시: '대전',
    울산광역시: '울산',
    세종특별자치시: '세종',
    경기도: '경기',
    강원도: '강원',
    충청북도: '충북',
    충청남도: '충남',
    전라북도: '전북',
    전라남도: '전남',
    경상북도: '경북',
    경상남도: '경남',
    제주특별자치도: '제주',
  })[region] ?? region

export function normalizeRegion(raw: string) {
  const first = raw.split('|')[0]?.trim() || raw.trim()
  return aliases[first] ?? first
}

/** Vercel geolocation의 도시명(영문, 소문자)을 시·도로 매핑 — 주요 도시만 커버 */
const cityToRegion: Record<string, string> = {
  seoul: '서울특별시',
  busan: '부산광역시',
  daegu: '대구광역시',
  incheon: '인천광역시',
  gwangju: '광주광역시',
  daejeon: '대전광역시',
  ulsan: '울산광역시',
  sejong: '세종특별자치시',
  suwon: '경기도',
  seongnam: '경기도',
  goyang: '경기도',
  yongin: '경기도',
  bucheon: '경기도',
  ansan: '경기도',
  anyang: '경기도',
  pyeongtaek: '경기도',
  siheung: '경기도',
  gimpo: '경기도',
  hanam: '경기도',
  chuncheon: '강원도',
  wonju: '강원도',
  gangneung: '강원도',
  sokcho: '강원도',
  cheongju: '충청북도',
  chungju: '충청북도',
  cheonan: '충청남도',
  asan: '충청남도',
  seosan: '충청남도',
  jeonju: '전라북도',
  iksan: '전라북도',
  gunsan: '전라북도',
  mokpo: '전라남도',
  yeosu: '전라남도',
  suncheon: '전라남도',
  pohang: '경상북도',
  gumi: '경상북도',
  gyeongju: '경상북도',
  andong: '경상북도',
  changwon: '경상남도',
  gimhae: '경상남도',
  jinju: '경상남도',
  jeju: '제주특별자치도',
  seogwipo: '제주특별자치도',
}

/** ISO 3166-2:KR 지역 코드 → 시·도 (Vercel countryRegion이 이 형식을 줄 때 대비) */
const regionCodeToRegion: Record<string, string> = {
  '11': '서울특별시',
  '26': '부산광역시',
  '27': '대구광역시',
  '28': '인천광역시',
  '29': '광주광역시',
  '30': '대전광역시',
  '31': '울산광역시',
  '50': '세종특별자치시',
  '41': '경기도',
  '42': '강원도',
  '43': '충청북도',
  '44': '충청남도',
  '45': '전라북도',
  '46': '전라남도',
  '47': '경상북도',
  '48': '경상남도',
  '49': '제주특별자치도',
}

/**
 * Vercel geolocation()이 주는 city/countryRegion 값으로 17개 시·도 중 하나를 추정한다.
 * 정확도가 낮은 값이라 실제 배포 후 도시명 표기를 보고 목록을 보강해야 할 수 있다.
 */
export function guessRegionFromGeo(city?: string, countryRegion?: string) {
  if (city) {
    const match = cityToRegion[city.trim().toLowerCase()]
    if (match) return match
  }
  if (countryRegion) {
    const code = countryRegion.trim().toUpperCase().replace(/^KR-/, '')
    const match = regionCodeToRegion[code]
    if (match) return match
  }
  return null
}

export const regions = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
]
