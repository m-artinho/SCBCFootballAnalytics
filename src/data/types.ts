// Core domain types for the Player Intelligence Platform (Cortex).
// All data is static / in-memory — see §9 of the PRD.

// Squad uses all positions; market + compare go deep on GK / DEF / ST only.
export type Position = 'GK' | 'DEF' | 'ST' | 'MID' | 'FB' | 'WING'
export type PlayerType = 'squad' | 'market'

export interface Metric {
  key: string // e.g. 'npxg_90'
  label: string // 'Non-penalty xG /90'
  short: string // compact label for the radar axis ('npxG')
  desc: string // plain-language definition (shown as a tooltip)
  value: number // raw per-90 / percentage
  percentile: number // 0–100 vs positional benchmark (computed at load)
  weight: 1 | 2 | 3
  inverted?: boolean // true => lower raw is better (e.g. errors)
}

export interface Player {
  id: string
  name: string // fictional
  type: PlayerType
  club: string // squad => 'Atlético Mondego FC'; market => other fictional clubs
  position: Position
  age: number
  marketValue: number // € — pre-wired for benchmarking increment
  impactScore: number // 0–100, position-normalized composite
  metrics: Metric[] // position-relevant set
}

export interface PositionBenchmark {
  position: Position
  metricKey: string
  // distribution summary used to derive percentiles cheaply
  p10: number
  p30: number
  p50: number
  p70: number
  p85: number
  p90: number
}
