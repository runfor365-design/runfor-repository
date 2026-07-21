'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'
import type { NormalizedRace } from '@/types/race'

interface Props {
  races: NormalizedRace[]
  onSelect: (race: NormalizedRace) => void
}

export default function RaceCalendar({ races, onSelect }: Props) {
  return (
    <section className="calendar-panel">
      <div className="panel-toolbar">
        <div className="status-legend">
          <span>
            <i className="open" />
            접수중
          </span>
          <span>
            <i className="soon" />
            접수예정
          </span>
          <span>
            <i className="closed" />
            마감
          </span>
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date()}
        locale={koLocale}
        headerToolbar={{ left: 'prev', center: 'title', right: 'next today' }}
        buttonText={{ today: '오늘' }}
        dayMaxEvents={2}
        fixedWeekCount={false}
        height="auto"
        events={races.map((race) => ({
          id: race.slug,
          title: race.대회명.replace(/^20\d{2}년?\s*/, ''),
          date: race.date,
          classNames: [`event-${race.status}`],
        }))}
        eventClick={(info) => {
          const race = races.find((item) => item.slug === info.event.id)
          if (race) onSelect(race)
        }}
        eventDidMount={(info) => {
          info.el.setAttribute('aria-label', `${info.event.title} 상세 보기`)
        }}
      />
    </section>
  )
}
