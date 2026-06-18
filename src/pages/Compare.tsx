import { Link } from 'react-router-dom'
import { getPlayer } from '../data/players'
import { Player } from '../data/types'
import { useCompare } from '../context/CompareContext'
import { RadarPanel, RadarRow } from '../components/RadarPanel'
import { formatEuro, POSITION_LABEL, scoreClasses } from '../lib/format'

const SERIES_COLORS = ['#1d4ed8', '#db2777', '#059669']

export function Compare() {
  const { ids, remove, clear } = useCompare()
  const players = ids.map(getPlayer).filter((p): p is Player => Boolean(p))

  if (players.length === 0) {
    return (
      <EmptyState>
        Add 2–3 players to compare them side by side. Use the{' '}
        <span className="font-semibold">+ Compare</span> button on the{' '}
        <Link to="/market" className="text-brand hover:underline">
          market list
        </Link>{' '}
        or any player profile.
      </EmptyState>
    )
  }

  const mixedPositions = new Set(players.map((p) => p.position)).size > 1

  // Radar axis = the metric set of the first selected player; other players are
  // aligned by metric key (works cleanly when positions match).
  const axisMetrics = players[0].metrics
  const radarData: RadarRow[] = axisMetrics.map((m) => {
    const row: RadarRow = { metric: m.short }
    players.forEach((p, i) => {
      const match = p.metrics.find((x) => x.key === m.key)
      row[`p${i}`] = match ? match.percentile : 0
    })
    return row
  })
  const series = players.map((p, i) => ({
    key: `p${i}`,
    name: p.name,
    color: SERIES_COLORS[i % SERIES_COLORS.length],
  }))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compare</h1>
          <p className="text-sm text-slate-500">{players.length} of 3 players selected</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Clear all
        </button>
      </div>

      {/* Selected player cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {players.map((p, i) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
                />
                <Link
                  to={`/${p.type === 'squad' ? 'squad' : 'market'}/${p.id}`}
                  className="font-semibold text-slate-800 hover:text-brand"
                >
                  {p.name}
                </Link>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="text-slate-400 hover:text-rose-600"
                title="Remove"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {POSITION_LABEL[p.position]} · {p.club}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className={`rounded px-2 py-0.5 text-sm font-bold ${scoreClasses(p.impactScore)}`}>
                {p.impactScore}
              </span>
              <span className="text-sm font-semibold text-slate-700">{formatEuro(p.marketValue)}</span>
            </div>
          </div>
        ))}
      </div>

      {mixedPositions && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Players span different positions — the radar uses {players[0].name}&apos;s metric set and
          aligns others by matching metric. Impact Scores remain position-normalized and are not
          directly comparable across positions.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Radar overlay */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Radar overlay — percentiles
          </h2>
          <RadarPanel data={radarData} series={series} height={340} />
          <div className="mt-2 flex flex-wrap gap-3">
            {series.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </section>

        {/* Metric table */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Key metrics (percentile)
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-2 font-semibold">Metric</th>
                {players.map((p, i) => (
                  <th key={p.id} className="px-1 py-2 text-right font-semibold">
                    <span style={{ color: SERIES_COLORS[i % SERIES_COLORS.length] }}>
                      {p.name.split(' ')[0]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {axisMetrics.map((m) => (
                <tr key={m.key} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 pr-2 text-slate-600">{m.short}</td>
                  {players.map((p) => {
                    const match = p.metrics.find((x) => x.key === m.key)
                    return (
                      <td key={p.id} className="px-1 py-2 text-right">
                        {match ? (
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${scoreClasses(
                              match.percentile,
                            )}`}
                          >
                            {match.percentile}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200">
                <td className="py-2 pr-2 font-semibold text-slate-700">Impact</td>
                {players.map((p) => (
                  <td key={p.id} className="px-1 py-2 text-right font-bold text-slate-800">
                    {p.impactScore}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Compare</h1>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        {children}
      </div>
    </div>
  )
}
