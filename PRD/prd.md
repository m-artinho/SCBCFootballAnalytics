# PRD — Player Intelligence Platform (Working name: **Cortex**)

> **Format note for the implementing agent (Claude Code):** This is the build spec for a *functional clickable prototype*, not a production system. Optimize for a logical, demoable user journey over completeness. No backend, no real API calls — all data is static and in-memory. Build it to deploy on GitHub Pages.

---

## 1. Context & Hypothesis

A seed-funded B2B SaaS startup is building a Player Intelligence Platform for professional football (soccer) clubs. **First PM, 5 engineers, 6-month runway to MVP, target customers = mid-tier European clubs.**

**Hypothesis:** Clubs make suboptimal **transfer and training** decisions because they cannot effectively translate player performance data into actionable insights. The gap is *not* data availability (StatsBomb, Opta, Wyscout already sell the data) — it is **interpretation and workflow integration**. Our wedge is the intelligence + workflow layer on top of licensed data, not data collection.

**This prototype demonstrates that wedge end-to-end for three positions.**

---

## 2. Users & Jobs To Be Done

One primary user persona, two jobs.

**Persona:** Technical Director / Head of Recruitment at a mid-tier club. Time-poor, accountable for both squad development and transfer spend, not a data scientist.

| Job | Pool | Core question | Action it drives |
|---|---|---|---|
| **Develop the squad** | Players the club owns | "Who needs to improve what?" | Training priorities |
| **Improve the squad via transfers** | Players in the market | "Who should we sign, and are they worth it?" | Buy / shortlist |

Both jobs run the same loop: **Evaluate → understand the gap → act** (act = *train* for squad, *buy* for market).

---

## 3. The Core Concept: Impact Score + Gap-Based Insights

This is the intellectual core of the product. Implement it exactly as described — it must be defensible and transparent (no opaque AI scoring).

### 3.1 Player Impact Score (the headline number)
- A single composite **0–100 score**, conceptually inspired by possession-value / VAEP frameworks (value of on-ball actions toward scoring/preventing goals).
- It is a **level**: "how good is this player among peers **in the same position**."
- **Computation (mock):** each player has a set of per-90 underlying metrics. Compute a **position-weighted composite** of those metrics (weights reflect what matters for that position — see §5), then convert to a **percentile (0–100) against that position's benchmark distribution**.
- Always displayed **with its position** ("78 — among Centre-Backs"). Never compare scores across positions as raw numbers.

### 3.2 Insights = gaps from an *independent* anchor (not from the score itself)
The score tells you the level. Insight comes from comparing actual performance to an **independent expectation**:

- **Anchor A — positional peers → Training insights.** For each position-relevant metric, compute the player's percentile vs the positional benchmark. Low percentile on an important metric = a development gap; very high = a saturated strength. (§6)
- **Anchor B — market value → Undervalued/overvalued.** A player's price implies an expected level; the gap between price-implied expectation and actual Impact Score reveals value. (Powers the live increment — §8. Data is pre-wired in MVP; the view is not built yet.)

> **Why this matters (interview defense):** measuring "distance from the expected performance of a player's own percentile" is circular — the percentile is defined by the performance. Gaps are only meaningful against an *independent* anchor (peers or price). State this if challenged.

---

## 4. MVP Scope

### In scope
1. **Squad Dashboard** — club overview, full squad list with Impact Scores, top squad-wide development priorities, position filter.
2. **Squad Player Profile** — Impact Score, positional radar (vs benchmark), per-metric percentile bars, rule-based **training insights** panel.
3. **Market (Scouting) List** — transfer targets for **GK / Defender / Striker only**, sortable by Impact Score and market value.
4. **Market Player Profile** — same profile component, market value prominent, plus comparison to the club's own players in that position.
5. **Compare view** — select 2–3 market targets (or a target vs a squad player) side-by-side (radar + key metrics).

### Explicitly OUT (cut for MVP discipline — say so out loud)
Injury/load prediction · video integration · tactical/formation tools · youth/academy tracking · contract & wage management · off-ball & tracking-data metrics · alerts/notifications · multi-club/multi-user · real data integration.

### Coverage scoping (deliberate, defensible)
- **Squad players:** ~24, **all positions**. Every squad player gets an Impact Score, radar, and training insights, powered by a cheap **synthetic positional benchmark** (statistical distributions per metric per position — just numbers, no fabricated profiles).
- **Market players + rich named comparison:** **GK / Defender / Striker only** (~8 each, ~24 total). We go *deep on three positions* rather than shallow across eleven.
- **Rationale to state live:** "We proved the full evaluate→act loop end-to-end on three positions. Expanding positions is data-entry, not new product risk."

---

## 5. Position Metric Sets (radar = ~6 metrics each)

Use realistic per-90 / percentage metrics modeled on StatsBomb's exposed fields. Weights below feed the Impact Score composite (high/med/low → e.g. 3/2/1).

**Striker (ST)**
- Non-penalty xG / 90 *(high)*
- xA / 90 *(med)*
- Non-penalty goals / 90 *(high)*
- Shot-creating actions / 90 *(med)*
- Aerial win % *(med)*
- Pressures (final third) / 90 *(low)*

**Centre-Back (DEF)**
- Possession-adjusted tackles + interceptions / 90 *(high)*
- Aerial duel win % *(high)*
- Blocks + clearances / 90 *(med)*
- Progressive passes / 90 *(med)*
- Pass completion % *(med)*
- Errors leading to shot / 90 — **inverted** (lower is better) *(low)*

**Goalkeeper (GK)**
- Shot-stopping: post-shot xG − goals conceded / 90 (GSAA) *(high)*
- Save % *(high)*
- Cross / aerial claim % *(med)*
- Pass completion % (distribution) *(med)*
- Defensive actions outside box (sweeper) / 90 *(low)*
- Goals prevented / 90 *(med)*

> For non-GK/DEF/ST squad positions, define a small generic outfield metric set (e.g. progressive actions, xG+xA, pass completion, defensive actions, duels won %) so their radar + insights still render against the synthetic benchmark.

---

## 6. Training Insight Engine (rule-based, transparent)

For each squad player, for each position-relevant metric, compute percentile vs the positional benchmark, then apply:

- **Development priority** — percentile **< 30** on a *high/med-weight* metric → `"Develop: {metric} lags peers (p{XX}). Prioritize in training."`
- **Strength / redirect** — percentile **> 85** → `"Strength: {metric} is elite (p{XX}). Maintain; redirect training capacity elsewhere."`
- **On track** — 30–85 → no flag (or muted "balanced").

Display rules:
- Show the **top 2–3 flags** per player (rank development priorities by weight × severity), not every metric, to keep it decision-ready.
- **Squad Dashboard** aggregates: "Top development priorities across the squad" (most common/severe gaps).

Thresholds (30 / 85) and weights live in a single `config` constant so they're easy to tune and explain.

---

## 7. Information Architecture & Routes

Use `react-router-dom` **HashRouter**.

| Route | Screen | Notes |
|---|---|---|
| `/` | Squad Dashboard | Club header, squad table (name, position, age, Impact Score, market value), position filter, "Top development priorities" panel |
| `/squad/:playerId` | Squad Player Profile | Impact Score, radar vs benchmark, per-metric percentile bars, training insights panel |
| `/market` | Market / Scouting List | GK/DEF/ST filter tabs, sortable by Impact Score & market value, "Add to compare" |
| `/market/:playerId` | Market Player Profile | Same profile component; market value prominent; "vs your squad in this position" mini-comparison; Shortlist button |
| `/compare` | Compare | 2–3 selected players side-by-side (radar overlay + metric table) |

> **Reuse one `<PlayerProfile>` component** for squad and market players (toggle the training-insights panel vs the market-value/value panel by `playerType`). This keeps the build small and makes the live increment trivial.

---

## 8. Pre-Wiring the Live Increment (do NOT build the view yet)

The interview will spring a surprise increment (likely: *"benchmark across the league to find undervalued players"*). Make it a ~15-minute additive change, not a refactor:

- **Every player already carries `marketValue` (€).**
- Add a derived helper (present in code, unused in UI): `valueGap = impactScore − expectedImpactForValue(position, marketValue)`, where `expectedImpactForValue` is a simple monotonic curve (impact rises with log market value within a position). Positive gap = delivering above price = **undervalued**.
- When the increment is requested, the additive build is: a new route `/market-map` with (a) a scatter (x = market value, y = Impact Score, quadrant lines) and (b) a sorted "Undervalued targets" table — both filtered to GK/DEF/ST. No data restructuring needed.

Keep this logic in the data layer and comment it `// pre-wired for benchmarking increment`.

---

## 9. Data Model

All static TS in `src/data/`. No fetch, no localStorage, no backend.

```ts
type Position = 'GK' | 'DEF' | 'ST' | 'MID' | 'FB' | 'WING'; // squad uses all; market+compare use GK/DEF/ST
type PlayerType = 'squad' | 'market';

interface Metric {
  key: string;          // e.g. 'npxg_90'
  label: string;        // 'Non-penalty xG /90'
  value: number;        // raw per-90 / percentage
  percentile: number;   // 0–100 vs positional benchmark (precomputed or computed at load)
  weight: 1 | 2 | 3;
  inverted?: boolean;   // true => lower raw is better (e.g. errors)
}

interface Player {
  id: string;
  name: string;         // fictional
  type: PlayerType;
  club: string;         // squad => 'Atlético Mondego FC'; market => other fictional clubs
  position: Position;
  age: number;
  marketValue: number;  // € — pre-wired for increment
  impactScore: number;  // 0–100, position-normalized composite
  metrics: Metric[];    // position-relevant set
}

interface PositionBenchmark {
  position: Position;
  metricKey: string;
  // distribution summary used to derive percentiles cheaply
  p10: number; p30: number; p50: number; p70: number; p85: number; p90: number;
}
```

- `src/data/players.ts` — 24 squad (all positions) + 24 market (GK/DEF/ST).
- `src/data/benchmarks.ts` — synthetic `PositionBenchmark[]` for every position used.
- `src/lib/scoring.ts` — composite → impactScore, percentile lookup, insight rules, `valueGap` helper, config thresholds/weights.

**Mock data realism:** keep metrics in plausible ranges (e.g. ST npxG/90 ~0.2–0.7; CB aerial win% ~45–75%; GK save% ~62–78%). Vary players so a few clearly stand out and a few clearly lag — the demo needs visible signal. Fictional Portuguese/Lusophone/mixed names; market players spread across other fictional mid-tier clubs.

---

## 10. Tech Stack & Deployment

- **Vite + React + TypeScript + Tailwind CSS.**
- **Routing:** `react-router-dom` `HashRouter` (required for GitHub Pages deep links).
- **Charts:** `recharts` (radar + scatter) — lightweight, no config.
- **State:** in-memory only (React state/context for "compare" selection). No persistence.
- **GitHub Pages:**
  - `vite.config.ts` → `base: '/<repo-name>/'` (project page) or `'/'` (user page).
  - Deploy via `gh-pages`: `npm i -D gh-pages`, add `"deploy": "vite build && gh-pages -d dist"`. (Or a GitHub Actions Pages workflow.)
- **Design:** clean, functional, "looks like a real B2B tool." Aesthetics are explicitly *not* judged — navigation logic and workflow realism are. Don't over-design; do make it coherent and uncluttered.

---

## 11. Build Order (for the agent)

1. Scaffold Vite + TS + Tailwind + router + recharts; configure `base` + `HashRouter`.
2. Data layer: types, `benchmarks.ts`, `players.ts`, `scoring.ts` (composite, percentile, insights, valueGap).
3. `<PlayerProfile>` shared component (radar + percentile bars + swappable side panel).
4. Squad Dashboard (`/`) with table, filter, top-priorities panel.
5. Squad profile route + training insights.
6. Market list (`/market`) + market profile + "vs your squad" mini-comparison.
7. Compare view (`/compare`).
8. Polish nav + empty/edge states. Verify a clean end-to-end click path.
9. Leave the `valueGap` helper in place, commented, for the increment.

---

## 12. First Month Post-MVP (high-level only)

- **Week 1 — First client onboarding & instrumentation.** Swap mock data for one real provider feed (the client's league); add usage tracking to see which screens/insights get used.
- **Week 2 — Benchmarking / undervalued players (the increment, productionized)** + expand market coverage beyond the three positions.
- **Week 3 — Workflow depth.** Saved shortlists, shareable/exportable scouting reports (PDF) for the sporting director, basic multi-user.
- **Week 4 — Close the loop & expand.** Track which recommendations clubs acted on (validation of the hypothesis); begin scoping off-ball / tracking-data metrics to address the on-ball-only limitation.

---

## 13. Key Decisions To Defend (interview crib)

- **Why three positions:** depth over breadth proves the model end-to-end; expansion is data, not product risk.
- **Why rule-based insights:** transparent and defensible vs an opaque AI score a club can't trust or contest.
- **Why a percentile-level Impact Score + gap-based insights:** the score answers "how good," gaps answer "so what" — and gaps must use an independent anchor (peers / price), not the score itself.
- **Why we don't collect data:** clubs can already buy data; the unmet need is interpretation + workflow. That's the defensible wedge.
- **Why marketValue is in the model from day one:** the undervalued-players use case is one additive view away, not a rebuild.
