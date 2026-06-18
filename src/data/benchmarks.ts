// Position metric definitions + synthetic positional benchmarks (§5, §9).
//
// The benchmarks are *just numbers*: a distribution summary (p10..p90) per
// metric per position. They let us derive each player's percentile cheaply
// without fabricating thousands of peer profiles. Realistic ranges modeled on
// StatsBomb-style exposed fields.

import { Position, PositionBenchmark } from './types'

export interface MetricDef {
  key: string
  label: string
  short: string // compact radar-axis label
  desc: string // plain-language definition (shown as a tooltip)
  weight: 1 | 2 | 3 // high=3 / med=2 / low=1 → feeds the Impact Score composite
  inverted?: boolean // lower raw is better
}

// ── Position metric sets (radar = ~6 metrics each) ───────────────────────

const ST_METRICS: MetricDef[] = [
  { key: 'npxg_90', label: 'Non-penalty xG /90', short: 'npxG', weight: 3, desc: 'Non-penalty expected goals per 90 minutes — the quality of shots a striker gets into (penalties excluded). Measures chance quality independent of finishing luck.' },
  { key: 'xa_90', label: 'xA /90', short: 'xA', weight: 2, desc: 'Expected assists per 90 — how likely a player’s passes are to become goals, based on the quality of the chances they create.' },
  { key: 'npg_90', label: 'Non-penalty goals /90', short: 'npG', weight: 3, desc: 'Non-penalty goals actually scored per 90 minutes (penalties excluded).' },
  { key: 'sca_90', label: 'Shot-creating actions /90', short: 'SCA', weight: 2, desc: 'Shot-creating actions per 90 — the offensive actions (passes, dribbles, fouls drawn) that lead directly to a shot.' },
  { key: 'aerial_pct', label: 'Aerial win %', short: 'Aerial%', weight: 2, desc: 'Share of aerial duels won — headers contested and won vs total contested.' },
  { key: 'press_f3_90', label: 'Pressures (final third) /90', short: 'Press F3', weight: 1, desc: 'Pressures applied in the attacking third per 90 — how actively the striker presses high up the pitch.' },
]

const DEF_METRICS: MetricDef[] = [
  { key: 'padj_tkint_90', label: 'PAdj tackles + interceptions /90', short: 'Tk+Int', weight: 3, desc: 'Possession-adjusted tackles + interceptions per 90 — ball-winning volume, adjusted for how much possession the team concedes (so deep-block defenders aren’t over-credited).' },
  { key: 'aerial_pct', label: 'Aerial duel win %', short: 'Aerial%', weight: 3, desc: 'Share of aerial duels won — central to defending crosses and set pieces.' },
  { key: 'blk_clr_90', label: 'Blocks + clearances /90', short: 'Blk+Clr', weight: 2, desc: 'Blocks + clearances per 90 — last-line defensive volume clearing danger.' },
  { key: 'prog_pass_90', label: 'Progressive passes /90', short: 'Prog Pass', weight: 2, desc: 'Progressive passes per 90 — passes that move the ball significantly toward the opponent’s goal; measures build-up contribution.' },
  { key: 'pass_pct', label: 'Pass completion %', short: 'Pass%', weight: 2, desc: 'Pass completion percentage — share of attempted passes successfully completed.' },
  { key: 'err_shot_90', label: 'Errors leading to shot /90', short: 'Errors', weight: 1, inverted: true, desc: 'Errors leading to an opponent shot per 90 — defensive mistakes that gave up a shot. Lower is better, so this metric is inverted when scored.' },
]

const GK_METRICS: MetricDef[] = [
  { key: 'gsaa_90', label: 'GSAA (PSxG − goals conceded) /90', short: 'GSAA', weight: 3, desc: 'Goals saved above average per 90 — post-shot expected goals minus goals conceded. Positive means the keeper stops more than an average keeper would on the same shots.' },
  { key: 'save_pct', label: 'Save %', short: 'Save%', weight: 3, desc: 'Save percentage — share of shots on target the keeper saves.' },
  { key: 'claim_pct', label: 'Cross / aerial claim %', short: 'Claim%', weight: 2, desc: 'Cross / aerial claim success — share of claimable crosses caught or punched cleanly.' },
  { key: 'pass_pct', label: 'Pass completion % (distribution)', short: 'Pass%', weight: 2, desc: 'Distribution pass completion — share of the keeper’s passes that find a team-mate.' },
  { key: 'def_obox_90', label: 'Defensive actions outside box /90', short: 'Sweeper', weight: 1, desc: 'Defensive actions outside the penalty box per 90 — sweeper-keeper activity covering space behind the defence.' },
  { key: 'goals_prevented_90', label: 'Goals prevented /90', short: 'Goals Prev', weight: 2, desc: 'Goals prevented per 90 — shot-stopping value expressed as goals denied vs an average keeper.' },
]

// Generic outfield set for the non-GK/DEF/ST squad positions so their radar +
// insights still render against a synthetic benchmark (§5 note).
const GENERIC_METRICS: MetricDef[] = [
  { key: 'prog_actions_90', label: 'Progressive actions /90', short: 'Prog Act', weight: 3, desc: 'Progressive actions per 90 — carries and passes that move the ball significantly upfield toward the opponent’s goal.' },
  { key: 'xg_xa_90', label: 'xG + xA /90', short: 'xG+xA', weight: 2, desc: 'Expected goals + expected assists per 90 — combined attacking threat from chances both taken and created.' },
  { key: 'pass_pct', label: 'Pass completion %', short: 'Pass%', weight: 2, desc: 'Pass completion percentage — share of attempted passes successfully completed.' },
  { key: 'def_actions_90', label: 'Defensive actions /90', short: 'Def Act', weight: 2, desc: 'Defensive actions per 90 — tackles, interceptions, blocks and recoveries combined.' },
  { key: 'duels_won_pct', label: 'Duels won %', short: 'Duels%', weight: 1, desc: 'Share of duels won — ground and aerial contests won vs total contested.' },
]

export const POSITION_METRICS: Record<Position, MetricDef[]> = {
  ST: ST_METRICS,
  DEF: DEF_METRICS,
  GK: GK_METRICS,
  MID: GENERIC_METRICS,
  FB: GENERIC_METRICS,
  WING: GENERIC_METRICS,
}

// ── Benchmark distributions ──────────────────────────────────────────────

type Dist = { p10: number; p30: number; p50: number; p70: number; p85: number; p90: number }

const ST_BENCH: Record<string, Dist> = {
  npxg_90: { p10: 0.15, p30: 0.25, p50: 0.33, p70: 0.42, p85: 0.52, p90: 0.58 },
  xa_90: { p10: 0.08, p30: 0.13, p50: 0.18, p70: 0.24, p85: 0.3, p90: 0.34 },
  npg_90: { p10: 0.15, p30: 0.25, p50: 0.34, p70: 0.45, p85: 0.55, p90: 0.62 },
  sca_90: { p10: 1.8, p30: 2.6, p50: 3.2, p70: 3.9, p85: 4.6, p90: 5.0 },
  aerial_pct: { p10: 35, p30: 44, p50: 51, p70: 58, p85: 65, p90: 69 },
  press_f3_90: { p10: 3.0, p30: 4.5, p50: 5.6, p70: 6.8, p85: 7.9, p90: 8.6 },
}

const DEF_BENCH: Record<string, Dist> = {
  padj_tkint_90: { p10: 2.2, p30: 2.9, p50: 3.4, p70: 4.0, p85: 4.6, p90: 5.0 },
  aerial_pct: { p10: 48, p30: 56, p50: 62, p70: 68, p85: 73, p90: 76 },
  blk_clr_90: { p10: 3.0, p30: 4.2, p50: 5.1, p70: 6.2, p85: 7.2, p90: 7.9 },
  prog_pass_90: { p10: 2.5, p30: 3.8, p50: 4.8, p70: 6.0, p85: 7.2, p90: 8.0 },
  pass_pct: { p10: 78, p30: 83, p50: 86, p70: 89, p85: 92, p90: 93.5 },
  // raw error counts; inverted in the metric def so low raw → high percentile
  err_shot_90: { p10: 0.04, p30: 0.08, p50: 0.12, p70: 0.17, p85: 0.23, p90: 0.27 },
}

const GK_BENCH: Record<string, Dist> = {
  gsaa_90: { p10: -0.15, p30: -0.05, p50: 0.03, p70: 0.12, p85: 0.21, p90: 0.27 },
  save_pct: { p10: 62, p30: 66, p50: 69, p70: 72, p85: 75, p90: 77 },
  claim_pct: { p10: 84, p30: 88, p50: 91, p70: 93.5, p85: 95.5, p90: 96.5 },
  pass_pct: { p10: 68, p30: 74, p50: 78, p70: 82, p85: 86, p90: 88 },
  def_obox_90: { p10: 0.6, p30: 1.0, p50: 1.3, p70: 1.7, p85: 2.1, p90: 2.4 },
  goals_prevented_90: { p10: -0.12, p30: -0.03, p50: 0.04, p70: 0.12, p85: 0.2, p90: 0.25 },
}

const GENERIC_BENCH: Record<string, Dist> = {
  prog_actions_90: { p10: 3.0, p30: 4.5, p50: 5.8, p70: 7.2, p85: 8.6, p90: 9.5 },
  xg_xa_90: { p10: 0.08, p30: 0.15, p50: 0.22, p70: 0.31, p85: 0.42, p90: 0.49 },
  pass_pct: { p10: 76, p30: 81, p50: 85, p70: 88, p85: 91, p90: 92.5 },
  def_actions_90: { p10: 3.5, p30: 5.0, p50: 6.2, p70: 7.5, p85: 8.8, p90: 9.6 },
  duels_won_pct: { p10: 42, p30: 48, p50: 53, p70: 58, p85: 63, p90: 67 },
}

function toBenchmarks(position: Position, dists: Record<string, Dist>): PositionBenchmark[] {
  return Object.entries(dists).map(([metricKey, d]) => ({ position, metricKey, ...d }))
}

export const BENCHMARKS: PositionBenchmark[] = [
  ...toBenchmarks('ST', ST_BENCH),
  ...toBenchmarks('DEF', DEF_BENCH),
  ...toBenchmarks('GK', GK_BENCH),
  // The generic outfield distribution is reused for every generic position.
  ...toBenchmarks('MID', GENERIC_BENCH),
  ...toBenchmarks('FB', GENERIC_BENCH),
  ...toBenchmarks('WING', GENERIC_BENCH),
]
