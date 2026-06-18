import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { squadPlayers } from '../data/players'
import { Position } from '../data/types'
import { squadDevelopmentPriorities } from '../lib/scoring'
import { ALL_POSITIONS, formatEuro, POSITION_LABEL_PLURAL, scoreBarClass, scoreClasses } from '../lib/format'
import { InfoTip } from '../components/InfoTip'

type SortKey = 'impactScore' | 'marketValue' | 'age' | 'name'

const HOME_CLUB = 'Atlético Mondego FC'

export function SquadDashboard() {
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('impactScore')
  const [asc, setAsc] = useState(false)

  const positionsInSquad = ALL_POSITIONS.filter((p) => squadPlayers.some((s) => s.position === p))

  const filtered = useMemo(() => {
    const base = filter === 'ALL' ? squadPlayers : squadPlayers.filter((p) => p.position === filter)
    const sorted = [...base].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      return (a[sortKey] as number) - (b[sortKey] as number)
    })
    return asc ? sorted : sorted.reverse()
  }, [filter, sortKey, asc])

  const priorities = useMemo(
    () => squadDevelopmentPriorities(filter === 'ALL' ? squadPlayers : filtered),
    [filter, filtered],
  )

  const avgImpact = Math.round(
    squadPlayers.reduce((s, p) => s + p.impactScore, 0) / squadPlayers.length,
  )
  const totalValue = squadPlayers.reduce((s, p) => s + p.marketValue, 0)

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v)
    else {
      setSortKey(key)
      setAsc(key === 'name')
    }
  }

  return (
    <div className="space-y-6">
      {/* Club header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{HOME_CLUB}</h1>
          <p className="text-sm text-slate-500">Squad development overview · {squadPlayers.length} players</p>
        </div>
        <div className="flex gap-3">
          <Stat label="Squad size" value={`${squadPlayers.length}`} />
          <Stat label="Avg Impact" value={`${avgImpact}`} />
          <Stat label="Squad value" value={formatEuro(totalValue)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Squad table */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Position filter */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-100 p-3">
              <FilterChip active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
                All
              </FilterChip>
              {positionsInSquad.map((p) => (
                <FilterChip key={p} active={filter === p} onClick={() => setFilter(p)}>
                  {p}
                </FilterChip>
              ))}
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <Th onClick={() => toggleSort('name')} active={sortKey === 'name'} asc={asc}>
                    Player
                  </Th>
                  <th className="px-4 py-2 font-semibold">Pos</th>
                  <Th onClick={() => toggleSort('age')} active={sortKey === 'age'} asc={asc} right>
                    Age
                  </Th>
                  <Th
                    onClick={() => toggleSort('impactScore')}
                    active={sortKey === 'impactScore'}
                    asc={asc}
                    right
                  >
                    Impact
                  </Th>
                  <Th
                    onClick={() => toggleSort('marketValue')}
                    active={sortKey === 'marketValue'}
                    asc={asc}
                    right
                  >
                    Value
                  </Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <Link to={`/squad/${p.id}`} className="font-medium text-slate-800 hover:text-brand">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{p.position}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">{p.age}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${scoreClasses(
                          p.impactScore,
                        )}`}
                      >
                        {p.impactScore}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                      {formatEuro(p.marketValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top development priorities */}
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center text-sm font-semibold uppercase tracking-wide text-slate-500">
              Top development priorities
              <InfoTip
                align="right"
                text="Aggregates the per-player training gaps across the squad. “2 players · avg p25” means two players flag this metric as a development area, and their average percentile on it is 25 (i.e. they rank above only ~25% of positional peers). Ordered by overall severity (how far below peers × how important the metric is)."
              />
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Most common / severe gaps across {filter === 'ALL' ? 'the squad' : POSITION_LABEL_PLURAL[filter]}.
            </p>
            {priorities.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No development gaps flagged.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {priorities.slice(0, 5).map((pr) => (
                  <li key={pr.label}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-slate-700">{pr.label}</span>
                      <span className="text-xs text-slate-400">
                        {pr.count} player{pr.count > 1 ? 's' : ''} · avg p{pr.avgPercentile}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full ${scoreBarClass(pr.avgPercentile)}`}
                        style={{ width: `${pr.avgPercentile}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-center shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
        active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function Th({
  children,
  onClick,
  active,
  asc,
  right,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  asc: boolean
  right?: boolean
}) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-4 py-2 font-semibold hover:text-slate-600 ${
        right ? 'text-right' : ''
      } ${active ? 'text-slate-700' : ''}`}
    >
      {children}
      {active && <span className="ml-1">{asc ? '▲' : '▼'}</span>}
    </th>
  )
}
