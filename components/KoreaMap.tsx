'use client'

import { useEffect, useMemo, useState } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { NormalizedRace } from '@/types/race'
import { shortRegionName } from '@/lib/region-map'

interface Props { races: NormalizedRace[]; selectedRegion: string; onSelect: (region: string) => void }
interface MapFeatureProps { name: string; code: string }

export default function KoreaMap({ races, selectedRegion, onSelect }: Props) {
  const [features, setFeatures] = useState<Feature<Geometry, MapFeatureProps>[]>([])
  const [hovered, setHovered] = useState<string>('')
  const counts = useMemo(() => races.reduce<Record<string, number>>((acc, race) => { acc[race.region] = (acc[race.region] || 0) + 1; return acc }, {}), [races])

  useEffect(() => {
    fetch('/geo/korea-sido.topojson').then((res) => res.json()).then((topology: Topology) => {
      const key = Object.keys(topology.objects)[0]
      const collection = feature(topology, topology.objects[key] as GeometryCollection) as unknown as FeatureCollection<Geometry, MapFeatureProps>
      setFeatures(collection.features)
    }).catch(() => setFeatures([]))
  }, [])

  const { paths, labels } = useMemo(() => {
    if (!features.length) return { paths: [] as string[], labels: [] as [number, number][] }
    const collection = { type: 'FeatureCollection', features } as FeatureCollection<Geometry, MapFeatureProps>
    const projection = d3.geoMercator().fitExtent([[24, 16], [416, 450]], collection)
    const path = d3.geoPath(projection)
    return { paths: features.map((item) => path(item) || ''), labels: features.map((item) => path.centroid(item)) }
  }, [features])

  const max = Math.max(1, ...Object.values(counts))
  const color = d3.scaleLinear<string>().domain([0, max]).range(['#e8edf0', '#ff5b35'])

  return (
    <div className="map-wrap">
      <div className="map-heading"><div><span className="eyebrow">REGION MAP</span><h2>어디에서 달릴까요?</h2></div><button type="button" className={selectedRegion ? 'map-reset active' : 'map-reset'} onClick={() => onSelect('')}>전국 보기</button></div>
      <div className="map-canvas">
        {!features.length && <div className="map-loading">지도를 불러오는 중입니다</div>}
        <svg viewBox="0 0 440 470" role="img" aria-label="지역별 마라톤 대회 지도">
          <g>
            {features.map((item, index) => {
              const name = item.properties.name === '강원도' ? '강원도' : item.properties.name
              const selected = selectedRegion === name
              const count = counts[name] || 0
              return <path key={item.properties.code} d={paths[index]} fill={selected ? '#152c3c' : color(count)} className="map-region" stroke="#fff" strokeWidth="1.4" role="button" tabIndex={0} aria-label={`${shortRegionName(name)} ${count}개 대회`} onClick={() => onSelect(selected ? '' : name)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(selected ? '' : name) }} onMouseEnter={() => setHovered(name)} onMouseLeave={() => setHovered('')} />
            })}
          </g>
          <g className="map-labels" aria-hidden="true">
            {features.map((item, index) => { const name = item.properties.name; const count = counts[name] || 0; const [x, y] = labels[index] || [0, 0]; if (!count || ['서울특별시','인천광역시','대전광역시','광주광역시','대구광역시','울산광역시','부산광역시','세종특별자치시'].includes(name)) return null; return <text key={name} x={x} y={y}>{shortRegionName(name)} <tspan>{count}</tspan></text> })}
          </g>
        </svg>
        {hovered && <div className="map-tooltip"><strong>{shortRegionName(hovered)}</strong><span>{counts[hovered] || 0}개 대회</span></div>}
        <div className="map-legend"><span>대회 적음</span><i /><i /><i /><i /><span>많음</span></div>
      </div>
    </div>
  )
}
