import { Link, useParams } from 'react-router-dom'
import { getPlayer } from '../data/players'
import { PlayerProfile } from '../components/PlayerProfile'

export function SquadProfile() {
  const { playerId } = useParams()
  const player = playerId ? getPlayer(playerId) : undefined

  if (!player || player.type !== 'squad') {
    return <NotFound />
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm font-medium text-brand hover:underline">
        ← Back to squad
      </Link>
      <PlayerProfile player={player} />
    </div>
  )
}

function NotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-slate-600">Squad player not found.</p>
      <Link to="/" className="mt-2 inline-block text-sm font-medium text-brand hover:underline">
        ← Back to squad
      </Link>
    </div>
  )
}
