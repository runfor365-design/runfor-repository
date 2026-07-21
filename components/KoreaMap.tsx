'use client'

import { useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { NormalizedRace } from '@/types/race'
import { shortRegionName } from '@/lib/region-map'

interface Props {
  races: NormalizedRace[]
  selectedRegion: string
  onSelect: (region: string) => void
}
interface MapFeatureProps {
  name: string
  code: string
}

const labelOffsets: Record<string, [number, number]> = { 경기도: [10, 15] }

/** 독도·울릉도(동), 백령도 권역(서)처럼 본토에서 멀리 떨어진 섬을 빼서 큰 지역만 남긴다 */
function stripRemoteIslands(feat: Feature<Geometry, MapFeatureProps>) {
  if (feat.geometry.type !== 'MultiPolygon') return feat
  const coordinates = feat.geometry.coordinates.filter(
    (polygon) => !polygon.some((ring) => ring.some(([lng]) => lng > 130 || lng < 125.5)),
  )
  return { ...feat, geometry: { ...feat.geometry, coordinates } }
}

export default function KoreaMap({ races, selectedRegion, onSelect }: Props) {
  const [features, setFeatures] = useState<Feature<Geometry, MapFeatureProps>[]>([])
  const [hovered, setHovered] = useState<string>('')
  const counts = useMemo(
    () =>
      races.reduce<Record<string, number>>((acc, race) => {
        acc[race.region] = (acc[race.region] || 0) + 1
        return acc
      }, {}),
    [races],
  )

  useEffect(() => {
    fetch('/geo/korea-sido.topojson')
      .then((res) => res.json())
      .then((topology: Topology) => {
        const key = Object.keys(topology.objects)[0]
        const collection = feature(
          topology,
          topology.objects[key] as GeometryCollection,
        ) as unknown as FeatureCollection<Geometry, MapFeatureProps>
        setFeatures(collection.features.map(stripRemoteIslands))
      })
      .catch(() => setFeatures([]))
  }, [])

  const { paths, labels } = useMemo(() => {
    if (!features.length) return { paths: [] as string[], labels: [] as [number, number][] }
    const collection = { type: 'FeatureCollection', features } as FeatureCollection<
      Geometry,
      MapFeatureProps
    >
    const projection = d3.geoMercator().fitExtent(
      [
        [24, 16],
        [416, 450],
      ],
      collection,
    )
    const path = d3.geoPath(projection)
    // 경계 박스는 fitExtent가 이미 중앙에 맞추지만, 면적이 작은 섬이 한쪽으로 치우쳐 있으면
    // 실제 칠해지는 면적(시각적 무게중심)은 중앙에서 벗어난다. 면적 가중 중심으로 다시 정렬한다.
    let sumX = 0
    let sumArea = 0
    features.forEach((item) => {
      const area = Math.abs(path.area(item))
      const centroid = path.centroid(item)
      if (area > 0 && Number.isFinite(centroid[0])) {
        sumX += centroid[0] * area
        sumArea += area
      }
    })
    if (sumArea > 0) {
      const boxMidX = (24 + 416) / 2
      const [tx, ty] = projection.translate()
      projection.translate([tx - (sumX / sumArea - boxMidX), ty])
    }
    return {
      paths: features.map((item) => path(item) || ''),
      labels: features.map((item) => path.centroid(item)),
    }
  }, [features])

  const max = Math.max(1, ...Object.values(counts))
  const color = d3.scaleLinear<string>().domain([0, max]).range(['#e8edf0', '#ff5b35'])

  return (
    <div className="map-wrap">
      <div className="panel-toolbar">
        <button
          type="button"
          className={selectedRegion ? 'map-reset active' : 'map-reset'}
          onClick={() => onSelect('')}
        >
          전국 보기
        </button>
      </div>
      <div className="map-canvas">
        {!features.length && <div className="map-loading">지도를 불러오는 중입니다</div>}
        <svg viewBox="0 0 440 470" role="img" aria-label="지역별 마라톤 대회 지도">
          <g>
            {features.map((item, index) => {
              const name = item.properties.name === '강원도' ? '강원도' : item.properties.name
              const selected = selectedRegion === name
              const count = counts[name] || 0
              return (
                <path
                  key={item.properties.code}
                  d={paths[index]}
                  fill={selected ? '#152c3c' : color(count)}
                  className="map-region"
                  stroke="#fff"
                  strokeWidth="1.4"
                  role="button"
                  tabIndex={0}
                  aria-label={`${shortRegionName(name)} ${count}개 대회`}
                  onClick={() => onSelect(selected ? '' : name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelect(selected ? '' : name)
                  }}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered('')}
                />
              )
            })}
          </g>
          <g className="map-labels" aria-hidden="true">
            {features.map((item, index) => {
              const name = item.properties.name
              const count = counts[name] || 0
              const [cx, cy] = labels[index] || [0, 0]
              const [ox, oy] = labelOffsets[name] || [0, 0]
              if (!count) return null
              return (
                <text key={name} x={cx + ox} y={cy + oy}>
                  {shortRegionName(name)} <tspan>{count}</tspan>
                </text>
              )
            })}
          </g>
        </svg>
        {hovered && (
          <div className="map-tooltip">
            <strong>{shortRegionName(hovered)}</strong>
            <span>{counts[hovered] || 0}개 대회</span>
          </div>
        )}
        <div className="map-legend">
          <span>대회 적음</span>
          <i />
          <i />
          <i />
          <i />
          <span>많음</span>
        </div>
      </div>
    </div>
  )
}
