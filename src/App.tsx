import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SquadDashboard } from './pages/SquadDashboard'
import { SquadProfile } from './pages/SquadProfile'
import { MarketList } from './pages/MarketList'
import { MarketProfile } from './pages/MarketProfile'
import { Compare } from './pages/Compare'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SquadDashboard />} />
        <Route path="/squad/:playerId" element={<SquadProfile />} />
        <Route path="/market" element={<MarketList />} />
        <Route path="/market/:playerId" element={<MarketProfile />} />
        <Route path="/compare" element={<Compare />} />
        {/* Unknown routes fall back to the squad dashboard. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
