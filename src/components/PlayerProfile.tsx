import { Link } from 'react-router-dom'
import { Player } from '../data/types'
import { squadPlayers } from '../data/players'
import { trainingInsights } from '../lib/scoring'
import {
  formatEuro,
  IMPACT_EXPLAINER,
  PERCENTILE_EXPLAINER,
  POSITION_LABEL,
  scoreClasses,
} from '../lib/format'
import { CompareButton, ImpactBadge, PositionChip } from './Badges'
import { PercentileBars } from './PercentileBars'
import { RadarPanel, RadarRow } from './RadarPanel'
import { InfoTip } from './InfoTip'

// ONE shared profile component for squad and market players (§7). The swappable
// side panel (training insights vs market value/comparison) is the only thing
// that differs by playerType.
export function PlayerProfile({ player }: { player: Player }) {
  const radarData: RadarRow[] = player.metrics.map((m) => ({
    metric: m.short,
    player: m.percentile,
    benchmark: 50,
  }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{player.name}</h1>
            <PositionChip position={player.position} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {POSITION_LABEL[player.position]} · {player.club} · Age {player.age}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Market value</p>
            <p className="text-xl font-bold text-slate-900">{formatEuro(player.marketValue)}</p>
          </div>
          <div className="flex items-start">
            <ImpactBadge score={player.impactScore} position={player.position} size="lg" />
            <InfoTip text={IMPACT_EXPLAINER} align="right" width="w-72" />
          </div>
          <CompareButton id={player.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: radar + percentile bars */}
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Positional radar — percentile vs benchmark
            </h2>
            <RadarPanel
              data={radarData}
              series={[
                { key: 'player', name: player.name, color: '#1d4ed8' },
                { key: 'benchmark', name: 'Benchmark (p50)', color: '#94a3b8' },
              ]}
            />
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 flex items-center text-sm font-semibold uppercase tracking-wide text-slate-500">
              Per-metric percentiles
              <InfoTip text={PERCENTILE_EXPLAINER} align="left" />
            </h2>
            <p className="mb-3 text-xs text-slate-400">
              Hover a metric name for its definition · vertical line = median peer (p50)
            </p>
            <PercentileBars metrics={player.metrics} />
          </section>
        </div>

        {/* Right: swappable side panel */}
        <div>
          {player.type === 'squad' ? (
            <TrainingPanel player={player} />
          ) : (
            <MarketPanel player={player} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Squad side panel: rule-based training insights (§6) ──────────────────
function TrainingPanel({ player }: { player: Player }) {
  const insights = trainingInsights(player)
  const develop = insights.filter((i) => i.type === 'develop')
  const strength = insights.filter((i) => i.type === 'strength')

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center text-sm font-semibold uppercase tracking-wide text-slate-500">
        Training insights
        <InfoTip
          align="left"
          text="What to train next vs positional peers (an independent anchor, not the score itself). Development areas are the player's biggest relative gaps on important metrics; strengths are the metrics where they already rate above peers."
        />
      </h2>
      <p className="mt-1 text-xs text-slate-400">Train the gaps · lean on the strengths.</p>

      {develop.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-rose-600">
            Develop — train these
          </h3>
          <ul className="mt-2 space-y-2">
            {develop.map((i) => (
              <li
                key={i.metricKey}
                className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-900"
              >
                {i.tier === 'critical' && (
                  <span className="mr-1 rounded bg-rose-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-800">
                    Priority
                  </span>
                )}
                {i.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {strength.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-600">
            Already strong
          </h3>
          <ul className="mt-2 space-y-2">
            {strength.map((i) => (
              <li
                key={i.metricKey}
                className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900"
              >
                {i.tier === 'elite' && (
                  <span className="mr-1 rounded bg-emerald-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                    Elite
                  </span>
                )}
                {i.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

// ── Market side panel: value prominent + "vs your squad" mini-comparison ──
function MarketPanel({ player }: { player: Player }) {
  const peers = squadPlayers
    .filter((p) => p.position === player.position)
    .sort((a, b) => b.impactScore - a.impactScore)
  const squadAvg = peers.length
    ? Math.round(peers.reduce((s, p) => s + p.impactScore, 0) / peers.length)
    : null
  const beatsBest = peers.length > 0 && player.impactScore > peers[0].impactScore

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Transfer assessment
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Market value</p>
            <p className="text-2xl font-bold text-slate-900">{formatEuro(player.marketValue)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Impact Score</p>
            <p className="text-2xl font-bold text-slate-900">
              {player.impactScore}
              <span className="ml-1 text-sm font-medium text-slate-400">/ 100</span>
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          vs your squad — {POSITION_LABEL[player.position]}s
        </h2>
        {squadAvg !== null ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              {beatsBest ? (
                <>
                  Would be your <span className="font-semibold text-emerald-700">top-rated</span>{' '}
                  {POSITION_LABEL[player.position].toLowerCase()} (squad avg{' '}
                  <span className="font-semibold">{squadAvg}</span>).
                </>
              ) : (
                <>
                  Squad average Impact in this position is{' '}
                  <span className="font-semibold">{squadAvg}</span>; target rates{' '}
                  <span className="font-semibold">{player.impactScore}</span>.
                </>
              )}
            </p>
            <ul className="mt-3 space-y-2">
              {peers.map((p) => {
                const delta = player.impactScore - p.impactScore
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <Link to={`/squad/${p.id}`} className="font-medium text-slate-700 hover:text-brand">
                      {p.name}
                    </Link>
                    <span className="flex items-center gap-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-semibold ${scoreClasses(
                          p.impactScore,
                        )}`}
                      >
                        {p.impactScore}
                      </span>
                      <span
                        className={`w-12 text-right tabular-nums font-semibold ${
                          delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {delta >= 0 ? '+' : ''}
                        {delta}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No squad players in this position to compare.</p>
        )}
      </section>
    </div>
  )
}
