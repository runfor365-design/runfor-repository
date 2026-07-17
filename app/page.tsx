import DashboardClient from '@/components/DashboardClient'
import { getRaces } from '@/lib/races'

export default function Home() {
  return <DashboardClient races={getRaces()} />
}
