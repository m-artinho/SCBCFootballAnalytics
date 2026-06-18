import { Position } from '../data/types'

export const POSITION_LABEL: Record<Position, string> = {
  GK: 'Goalkeeper',
  DEF: 'Centre-Back',
  ST: 'Striker',
  MID: 'Midfielder',
  FB: 'Full-Back',
  WING: 'Winger',
}

export const POSITION_LABEL_PLURAL: Record<Position, string> = {
  GK: 'Goalkeepers',
  DEF: 'Centre-Backs',
  ST: 'Strikers',
  MID: 'Midfielders',
  FB: 'Full-Backs',
  WING: 'Wingers',
}

// Order used for filters / tabs so they read like a team sheet.
export const ALL_POSITIONS: Position[] = ['GK', 'DEF', 'FB', 'MID', 'WING', 'ST']
export const MARKET_POSITIONS: Position[] = ['GK', 'DEF', 'ST']

export function formatEuro(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    return `€${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`
  }
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`
  return `€${value}`
}

// Plain-language methodology, surfaced in the UI via InfoTips (feedback #2/#5).
export const IMPACT_EXPLAINER =
  'Impact Score is a 0–100 level, normalized within a position. For each ' +
  'position-relevant metric we compare the player’s per-90 / % value to a ' +
  'benchmark distribution for that position to get a percentile (0–100 = how ' +
  'many peers they beat on that metric). The Impact Score is the weighted ' +
  'average of those percentiles — high-importance metrics count more. It reflects ' +
  'level among peers in the same position only, and is independent of market value.'

export const PERCENTILE_EXPLAINER =
  'Each bar shows a percentile vs peers in the same position: p80 means the ' +
  'player ranks above ~80% of positional peers on that metric. The number on ' +
  'the left is their actual per-90 / % value; the bar’s fill is the percentile. ' +
  'The vertical line marks the median peer (p50).'

// Colour ramp for Impact Score / percentile chips (Tailwind classes).
export function scoreClasses(score: number): string {
  if (score >= 75) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (score >= 55) return 'bg-blue-100 text-blue-800 border-blue-200'
  if (score >= 40) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-rose-100 text-rose-800 border-rose-200'
}

// Solid bar fill colour for percentile bars.
export function scoreBarClass(score: number): string {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 55) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-rose-500'
}
