// Scoring + insight engine (§3, §6, §8).
//
// Everything here is transparent and rule-based by design — no opaque AI score.
//   • impactScore  = position-weighted composite of per-metric percentiles
//   • percentiles  = interpolated against the synthetic positional benchmark
//   • insights     = gaps vs an *independent* anchor (peers → training)
//   • valueGap     = gaps vs price (pre-wired for the benchmarking increment)

import { BENCHMARKS, MetricDef, POSITION_METRICS } from '../data/benchmarks'
import { Metric, Player, PlayerType, Position, PositionBenchmark } from '../data/types'

// ── Tunable config (thresholds + composite weighting live in one place) ──
// Insights are improvement-oriented: a player's *relative* weak spots are always
// worth training even when they clear an absolute "no longer a problem" bar.
export const config = {
  eliteThreshold: 85, // percentile at/above this on any metric = elite strength
  strongThreshold: 70, // at/above this = a dependable strength to lean on
  developThreshold: 60, // a weighted metric BELOW an above-average peer level → train it
  criticalThreshold: 30, // clearly lagging peers → top training priority
  maxDevelop: 3, // cap development flags shown
  maxStrength: 2, // cap strengths shown
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

// ── Percentile lookup ────────────────────────────────────────────────────
// Piecewise-linear interpolation of a raw value against the benchmark's
// p10..p90 anchors, with gentle linear extrapolation in the tails.

const benchIndex = new Map<string, PositionBenchmark>()
for (const b of BENCHMARKS) benchIndex.set(`${b.position}:${b.metricKey}`, b)

export function percentileFromBenchmark(
  value: number,
  b: PositionBenchmark,
  inverted = false,
): number {
  const anchors: { p: number; v: number }[] = [
    { p: 10, v: b.p10 },
    { p: 30, v: b.p30 },
    { p: 50, v: b.p50 },
    { p: 70, v: b.p70 },
    { p: 85, v: b.p85 },
    { p: 90, v: b.p90 },
  ]

  let pct: number
  const first = anchors[0]
  const last = anchors[anchors.length - 1]

  if (value <= first.v) {
    const next = anchors[1]
    const slope = (next.p - first.p) / (next.v - first.v)
    pct = first.p + (value - first.v) * slope
  } else if (value >= last.v) {
    const prev = anchors[anchors.length - 2]
    const slope = (last.p - prev.p) / (last.v - prev.v)
    pct = last.p + (value - last.v) * slope
  } else {
    pct = 50
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i]
      const c = anchors[i + 1]
      if (value >= a.v && value <= c.v) {
        const f = (value - a.v) / (c.v - a.v)
        pct = a.p + f * (c.p - a.p)
        break
      }
    }
  }

  pct = clamp(pct, 1, 99)
  // For inverted metrics (e.g. errors) a *low* raw value is elite, so flip.
  if (inverted) pct = 100 - pct
  return Math.round(pct)
}

export function percentileFor(position: Position, def: MetricDef, value: number): number {
  const b = benchIndex.get(`${position}:${def.key}`)
  if (!b) return 50
  return percentileFromBenchmark(value, b, def.inverted)
}

// ── Composite Impact Score ───────────────────────────────────────────────
// Weighted average of per-metric percentiles → a 0–100 position-normalized
// level ("how good among peers in the same position"). Always read with the
// position; never compared across positions as a raw number (§3.1).
export function computeImpactScore(metrics: Metric[]): number {
  const totalWeight = metrics.reduce((s, m) => s + m.weight, 0)
  const weighted = metrics.reduce((s, m) => s + m.percentile * m.weight, 0)
  return Math.round(weighted / totalWeight)
}

// ── Player builder ───────────────────────────────────────────────────────
// Raw per-90 values are authored in players.ts; percentiles + impactScore are
// derived here at load time so the two can never drift out of sync.
export interface PlayerSpec {
  id: string
  name: string
  club: string
  position: Position
  age: number
  marketValue: number
  // raw metric values, in the same order as POSITION_METRICS[position]
  raw: number[]
}

export function buildPlayer(spec: PlayerSpec, type: PlayerType): Player {
  const defs = POSITION_METRICS[spec.position]
  const metrics: Metric[] = defs.map((def, i) => {
    const value = spec.raw[i]
    return {
      key: def.key,
      label: def.label,
      short: def.short,
      desc: def.desc,
      value,
      percentile: percentileFor(spec.position, def, value),
      weight: def.weight,
      inverted: def.inverted,
    }
  })
  return {
    id: spec.id,
    name: spec.name,
    type,
    club: spec.club,
    position: spec.position,
    age: spec.age,
    marketValue: spec.marketValue,
    impactScore: computeImpactScore(metrics),
    metrics,
  }
}

// ── Training insight engine (Anchor A: positional peers, §6) ─────────────
// Goal: tell the coach what to TRAIN (relative weak points) and what the player
// is already good at — comparing to positional peers (an independent anchor),
// never to the player's own score. A player almost always has something to
// improve, so even mid-range weighted metrics surface as development areas.
export type InsightType = 'develop' | 'strength'
export type InsightTier = 'critical' | 'improve' | 'strong' | 'elite'

export interface Insight {
  type: InsightType
  tier: InsightTier
  metricKey: string
  label: string
  percentile: number
  text: string
  priority: number // ranking key: weight × severity (develop) or percentile (strength)
  fallback?: boolean // true => surfaced only to keep the panel actionable
}

export function trainingInsights(player: Player): Insight[] {
  const develop: Insight[] = []
  const strength: Insight[] = []

  for (const m of player.metrics) {
    const p = m.percentile
    // Development: any meaningful (weight ≥ 2) metric below an above-average peer
    // level is worth training — the further below, the higher the priority.
    if (m.weight >= 2 && p < config.developThreshold) {
      const tier: InsightTier = p < config.criticalThreshold ? 'critical' : 'improve'
      develop.push({
        type: 'develop',
        tier,
        metricKey: m.key,
        label: m.label,
        percentile: p,
        text:
          tier === 'critical'
            ? `Develop ${m.label}: lags peers (p${p}). Make this a top training priority.`
            : `Develop ${m.label}: trails peers (p${p}). Clear room to improve in training.`,
        priority: (config.developThreshold - p) * m.weight,
      })
    } else if (p >= config.strongThreshold) {
      const tier: InsightTier = p >= config.eliteThreshold ? 'elite' : 'strong'
      strength.push({
        type: 'strength',
        tier,
        metricKey: m.key,
        label: m.label,
        percentile: p,
        text:
          tier === 'elite'
            ? `${m.label}: elite (p${p}). Already a standout — build the player's game around it.`
            : `${m.label}: above peers (p${p}). Already a dependable strength.`,
        priority: p,
      })
    }
  }

  develop.sort((a, b) => b.priority - a.priority)
  strength.sort((a, b) => b.priority - a.priority)

  // Always-actionable fallbacks: never leave the coach with nothing. If a player
  // clears every development bar, still surface their single weakest weighted
  // metric as "most room to grow"; if nothing reaches a strength bar, surface
  // their best metric as a relative strength.
  if (develop.length === 0) {
    const weakest = [...player.metrics]
      .filter((m) => m.weight >= 2)
      .sort((a, b) => a.percentile - b.percentile)[0]
    if (weakest) {
      develop.push({
        type: 'develop',
        tier: 'improve',
        metricKey: weakest.key,
        label: weakest.label,
        percentile: weakest.percentile,
        text: `Most room to grow: ${weakest.label} (p${weakest.percentile}). Relative weak point to target in training.`,
        priority: 0,
        fallback: true,
      })
    }
  }
  if (strength.length === 0) {
    const best = [...player.metrics].sort((a, b) => b.percentile - a.percentile)[0]
    if (best) {
      strength.push({
        type: 'strength',
        tier: 'strong',
        metricKey: best.key,
        label: best.label,
        percentile: best.percentile,
        text: `Relative strength: ${best.label} (p${best.percentile}). The player's most reliable area.`,
        priority: best.percentile,
        fallback: true,
      })
    }
  }

  return [...develop.slice(0, config.maxDevelop), ...strength.slice(0, config.maxStrength)]
}

// ── Squad-wide aggregation: "Top development priorities" (§6) ─────────────
export interface SquadPriority {
  label: string
  count: number // how many squad players flag this gap
  avgPercentile: number
  severity: number // summed weight × severity across the squad
}

export function squadDevelopmentPriorities(players: Player[]): SquadPriority[] {
  const acc = new Map<string, { count: number; sumP: number; sumSev: number }>()
  for (const p of players) {
    for (const ins of trainingInsights(p)) {
      if (ins.type !== 'develop' || ins.fallback) continue
      const e = acc.get(ins.label) ?? { count: 0, sumP: 0, sumSev: 0 }
      e.count += 1
      e.sumP += ins.percentile
      e.sumSev += ins.priority
      acc.set(ins.label, e)
    }
  }
  return [...acc.entries()]
    .map(([label, e]) => ({
      label,
      count: e.count,
      avgPercentile: Math.round(e.sumP / e.count),
      severity: e.sumSev,
    }))
    .sort((a, b) => b.severity - a.severity)
}

// ─────────────────────────────────────────────────────────────────────────
// pre-wired for benchmarking increment
// ─────────────────────────────────────────────────────────────────────────
// Anchor B (§3.2 / §8): price implies an expected level. Each position has a
// simple *monotonic* curve where expected impact rises with log market value.
//   valueGap = impactScore − expectedImpactForValue(position, marketValue)
// Positive gap => delivering above what the price implies => UNDERVALUED.
//
// This is intentionally unused in the UI. When the surprise increment lands
// ("benchmark the league to find undervalued players") the additive build is a
// new /market-map route (scatter + sorted table) reading valueGap — no data
// restructuring required.
const VALUE_CURVE: Record<Position, { refValue: number; refImpact: number; slope: number }> = {
  GK: { refValue: 4_000_000, refImpact: 50, slope: 20 },
  DEF: { refValue: 6_000_000, refImpact: 50, slope: 20 },
  ST: { refValue: 9_000_000, refImpact: 50, slope: 20 },
  MID: { refValue: 6_000_000, refImpact: 50, slope: 20 },
  FB: { refValue: 4_000_000, refImpact: 50, slope: 20 },
  WING: { refValue: 6_000_000, refImpact: 50, slope: 20 },
}

export function expectedImpactForValue(position: Position, marketValue: number): number {
  const c = VALUE_CURVE[position]
  const v = Math.max(marketValue, 100_000)
  return clamp(c.refImpact + c.slope * Math.log10(v / c.refValue), 1, 99)
}

export function valueGap(player: Player): number {
  return player.impactScore - expectedImpactForValue(player.position, player.marketValue)
}
