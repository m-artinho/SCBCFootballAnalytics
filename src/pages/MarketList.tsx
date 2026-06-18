import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { marketPlayers } from '../data/players'
import { Position } from '../data/types'
import { formatEuro, MARKET_POSITIONS, POSITION_LABEL_PLURAL, scoreClasses } from '../lib/format'
import { CompareButton } from '../components/Badges'

type SortKey = 'impactScore' | 'marketValue'

// Illustrative budget caps (€) — one of several possible market filters.
const BUDGET_OPTIONS: { label: string; max: number }[] = [
  { label: 'Any budget', max: Infinity },
  { label: '≤ €5M', max: 5_000_000 },
  { label: '≤ €10M', max: 10_000_000 },
  { label: '≤ €20M', max: 20_000_000 },
]

export function MarketList() {
  const [tab, setTab] = useState<Position>('ST')
  const [sortKey, setSortKey] = useState<SortKey>('impactScore')
  const [asc, setAsc] = useState(false)
  const [query, setQuery] = useState('')
  const [budgetIdx, setBudgetIdx] = useState(0)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const maxBudget = BUDGET_OPTIONS[budgetIdx].max
    const base = marketPlayers.filter(
      (p) =>
        p.position === tab &&
        p.marketValue <= maxBudget &&
        (q === '' || p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q)),
    )
    const sorted = [...base].sort((a, b) => a[sortKey] - b[sortKey])
    return asc ? sorted : sorted.reverse()
  }, [tab, sortKey, asc, query, budgetIdx])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v)
    else {
      setSortKey(key)
      setAsc(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scouting market</h1>
        <p className="text-sm text-slate-500">
          Transfer targets · deep coverage on Goalkeepers, Centre-Backs &amp; Strikers
        </p>
      </div>

      {/* Position tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {MARKET_POSITIONS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setTab(p)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === p
                ? 'border-brand text-brand'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {POSITION_LABEL_PLURAL[p]}
          </button>
        ))}
      </div>

      {/* Search + budget filter (illustrative — one of several possible filters) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative grow sm:max-w-xs">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or club…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Budget
          <select
            value={budgetIdx}
            onChange={(e) => setBudgetIdx(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {BUDGET_OPTIONS.map((b, i) => (
              <option key={b.label} value={i}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-slate-400">
          {rows.length} {rows.length === 1 ? 'target' : 'targets'}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2 font-semibold">Player</th>
              <th className="px-4 py-2 font-semibold">Club</th>
              <th className="px-4 py-2 text-right font-semibold">Age</th>
              <SortableTh onClick={() => toggleSort('impactScore')} active={sortKey === 'impactScore'} asc={asc}>
                Impact
              </SortableTh>
              <SortableTh onClick={() => toggleSort('marketValue')} active={sortKey === 'marketValue'} asc={asc}>
                Value
              </SortableTh>
              <th className="px-4 py-2 text-right font-semibold">Compare</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                  No targets match your search and budget. Try widening the budget or clearing the
                  search.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <Link to={`/market/${p.id}`} className="font-medium text-slate-800 hover:text-brand">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{p.club}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">{p.age}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${scoreClasses(p.impactScore)}`}>
                    {p.impactScore}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                  {formatEuro(p.marketValue)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <CompareButton id={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SortableTh({
  children,
  onClick,
  active,
  asc,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  asc: boolean
}) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-4 py-2 text-right font-semibold hover:text-slate-600 ${
        active ? 'text-slate-700' : ''
      }`}
    >
      {children}
      {active && <span className="ml-1">{asc ? '▲' : '▼'}</span>}
    </th>
  )
}
