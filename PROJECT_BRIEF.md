# Cortex — Project Brief & Pitch Companion

> **Purpose of this doc:** a self-contained briefing on what was built, how it differs from the original PRD, and a glossary of every football/analytics term used — so it can be fed to an assistant (or a teammate) with **zero prior context** to help craft the pitch, demo script, and interview answers.

Cortex is a **functional clickable prototype** of a B2B "Player Intelligence Platform" for professional football clubs. It was built from `PRD/prd.md`. It is a **demo, not production**: no backend, no real data, no API calls — everything is static and computed in-memory in the browser.

---

## 1. The one-paragraph pitch

Mid-tier football clubs already *buy* performance data (StatsBomb, Opta, Wyscout). What they lack is **interpretation and workflow** — turning that data into "who do we train on what?" and "who do we sign, and are they worth it?". Cortex is the **intelligence + workflow layer on top of licensed data**, not another data vendor. The prototype proves the full **Evaluate → understand the gap → act** loop end-to-end for three positions (Goalkeeper, Centre-Back, Striker), with a transparent, defensible scoring model rather than an opaque "AI score" a club can't trust or contest.

---

## 2. Who it's for (persona & jobs)

- **Persona:** Technical Director / Head of Recruitment at a mid-tier European club. Time-poor, accountable for **both** squad development and transfer spend, **not** a data scientist.
- **Two jobs, same loop:**
  | Job | Player pool | Core question | Action it drives |
  |---|---|---|---|
  | **Develop the squad** | Players the club owns | "Who needs to improve what?" | Training priorities |
  | **Improve via transfers** | Players in the market | "Who should we sign, and are they worth it?" | Buy / shortlist |

---

## 3. What was built (screens & routes)

The app uses **hash-based routing** (URLs look like `/#/market`) so it works on GitHub Pages with no server. Five screens:

| Route | Screen | What it does |
|---|---|---|
| `/` | **Squad Dashboard** | Club header + KPIs (squad size, avg Impact, total value). Sortable squad table (name, position, age, Impact Score, market value). Position filter chips. **"Top development priorities"** panel aggregating squad-wide training gaps. |
| `/squad/:id` | **Squad Player Profile** | Impact Score (with methodology tooltip), positional **radar** vs benchmark, per-metric **percentile bars** (with metric tooltips), and the **Training insights** panel. |
| `/market` | **Scouting / Market list** | GK / DEF / ST tabs. **Search** (name/club) + **budget filter**. Sortable by Impact & value. "+ Compare" per row. |
| `/market/:id` | **Market Player Profile** | Same profile component; market value prominent; **"vs your squad in this position"** mini-comparison (would this signing beat what we already have?). |
| `/compare` | **Compare** | 2–3 players side by side: **radar overlay** + metric table. Works for market-vs-market or market-vs-squad. In-memory selection (a "compare tray" in the nav). |

**Deliberately NOT built:** a league-wide "undervalued players" view (see §6 — it's held in reserve as the planned live increment).

**Design intent:** clean, functional, "looks like a real B2B tool." Aesthetics are explicitly *not* the point — navigation logic and workflow realism are.

---

## 4. The intellectual core: Impact Score + gap-based insights

This is the part to be able to defend. Two distinct ideas — keep them separate when explaining.

### 4.1 Impact Score = the **level** ("how good")
- A single **0–100 composite**, conceptually inspired by possession-value / VAEP frameworks (valuing on-ball actions by their contribution toward scoring / preventing goals).
- **How it's computed (transparent, no black box):**
  1. Each player has ~6 **per-90 / percentage metrics** relevant to their position.
  2. Each metric is converted to a **percentile (0–100)** by comparing the raw value to a **benchmark distribution for that position**.
  3. The Impact Score is the **weighted average of those percentiles** — important metrics (e.g. npxG for a striker) carry more weight than minor ones.
- It is **position-normalized**: always read as "**78 — among Centre-Backs**". You must **never** compare raw Impact Scores *across* positions (a GK's 80 and a striker's 80 aren't the same thing).
- **Market value is NOT part of the Impact Score.** Score = on-pitch level only.

### 4.2 Insights = the **gap** ("so what"), measured against an *independent* anchor
The score tells you the level; the *insight* comes from comparing actual performance to an **independent expectation**:

- **Anchor A — positional peers → Training insights.** For each metric, the player's percentile vs the positional benchmark. Low percentile on an important metric = a development gap; high = a strength. (Built.)
- **Anchor B — market value → Undervalued/overvalued.** Price implies an expected level; the gap between price-implied expectation and actual Impact Score reveals value. (Logic pre-wired, view not built — see §6.)

> **Why this matters (key defense):** measuring "distance from the expected performance of a player's own percentile" would be **circular** — the percentile *is* defined by the performance. Gaps are only meaningful against an **independent** anchor: **peers** (for training) or **price** (for value). State this if challenged.

---

## 5. How the prototype differs from the original PRD

Everything below is a deliberate change made **during build/iteration** based on user feedback. Useful for "what did you change and why" questions.

### 5.1 Training insight engine — reworked to be **improvement-oriented** (biggest change)
- **PRD original (§6):** flag a metric only if percentile **< 30** (development) or **> 85** (strength, worded "maintain; redirect training capacity elsewhere"). Anything 30–85 → no flag / "balanced."
- **Problem found:** players who were solid-but-unspectacular (e.g. a midfielder above peers on passing & defending but below on attacking output) showed as **"balanced — maintain"**, which gives a coach nothing to act on. The goal of the feature is to drive *training*, and players should aim to **improve**, not hold their level.
- **New behaviour:** four tiers, surfaced as **"Develop — train these"** and **"Already strong"**:
  | Tier | Rule | Meaning |
  |---|---|---|
  | `critical` | percentile < 30 (weighted metric) | "lags peers — top training priority" (tagged **Priority**) |
  | `improve` | percentile < 60 (weighted metric) | "trails peers — clear room to improve" |
  | `strong` | percentile ≥ 70 | "above peers — dependable strength" |
  | `elite` | percentile ≥ 85 | "elite — build the player's game around it" (tagged **Elite**) |
  - **Development bar raised from p30 → p60**, so a player's *relative* weak points surface even when not catastrophic.
  - **Strength wording changed** away from "maintain / redirect" toward "lean on it / build around it."
  - **Always-actionable fallback:** even an elite player gets a "most room to grow" pointer; a uniformly weak player still gets a "relative strength." The panel is never just "balanced."
  - All thresholds live in a single `config` constant in `src/lib/scoring.ts` (easy to tune/explain).

### 5.2 Additions (not in the PRD)
- **Metric tooltips:** hover any metric name to see a plain-language definition (xG, GSAA, progressive passes, etc.). Demo-friendly for non-analyst audiences.
- **Methodology tooltips (ⓘ):** next to the Impact Score (how it's computed), the percentile bars (what p-values mean), and the dashboard "Top development priorities" (what "2 players · avg p25" means).
- **Market search + budget filter:** the PRD only specified a sortable list; added a name/club search box and a budget cap dropdown (Any / ≤€5M / ≤€10M / ≤€20M) with a live result count and empty state. (Illustrative — other natural filters: min-Impact, age band, contract expiry.)

### 5.3 Removals
- **"Shortlist" button removed** from the market profile (PRD §7 mentioned it). It had no persistence (no backend), so it was cosmetic — cut for scope discipline.

### 5.4 Unchanged from PRD intent
- Three-position depth (GK/DEF/ST) for market + rich comparison; all positions for the squad.
- One reused `<PlayerProfile>` component for squad and market players.
- Static in-memory data, HashRouter, GitHub Pages target.
- The `valueGap` value logic is present but its view is **not** built.

---

## 6. The held-back increment (important for the interview)

The PRD (§8) deliberately **pre-wires but does not build** the "benchmark across the league to find undervalued players" view, because it's the likely **surprise increment** the interviewer will ask for live — and the whole point is to show it's a **~15-minute additive change, not a refactor**.

What's already in the code (`src/lib/scoring.ts`), unused in the UI:
- Every player carries `marketValue`.
- `expectedImpactForValue(position, value)` — a simple monotonic curve where expected impact rises with **log** market value, calibrated per position.
- `valueGap(player) = impactScore − expectedImpactForValue(position, marketValue)`. **Positive = delivering above what the price implies = undervalued.**

**Why `valueGap` and not a raw `impact ÷ price` ratio?** A raw ratio just rewards *cheapness* — it would rank a €1.5M backup above a €28M star. `valueGap` is position-aware and price-aware, so it measures genuine over/under-delivery vs market expectation. (Good talking point.)

When asked to build it, the additive work is: a new `/market-map` route with (a) a **scatter** (x = market value, y = Impact Score, with quadrant lines) and (b) a sorted **"Undervalued targets"** table — both filtered to GK/DEF/ST. **No data restructuring required.**

---

## 7. Glossary — every term used, in plain language

### Core scoring terms
- **Per 90 / per-90:** a stat expressed *per 90 minutes of play* (one full match), i.e. `(total ÷ minutes) × 90`. Normalizes for playing time so a rotation player and a regular starter are comparable. Caveat: it ignores sample size — a high rate from few minutes is noisier.
- **Percentile (p-value, e.g. "p80"):** where a player ranks among **peers in the same position** on one metric. p80 = better than ~80% of positional peers. The vertical line on the percentile bars marks the **median peer (p50)**.
- **Benchmark / positional benchmark:** the distribution of a metric for a position, summarized as cut-points (p10, p30, p50, p70, p85, p90). Used to convert a raw value into a percentile cheaply. In this prototype the benchmarks are **synthetic** (realistic numbers, not real peer data).
- **Impact Score:** the 0–100 position-normalized composite (see §4.1). Weighted average of a player's metric percentiles.
- **Weight (1/2/3 = low/med/high):** how much each metric counts toward the Impact Score, reflecting what matters for that position (e.g. npxG is high-weight for a striker).
- **Inverted metric:** one where **lower is better** (e.g. "errors leading to a shot"). The percentile is flipped so that few errors = a high (good) percentile.
- **valueGap:** Impact Score minus the impact you'd *expect* for the player's price. Positive = undervalued. (Pre-wired, not shown — §6.)

### Attacking metrics
- **xG (expected goals):** the probability a shot becomes a goal, based on shot quality (location, type, situation). Measures **chance quality**, independent of finishing luck.
- **npxG (non-penalty xG):** xG excluding penalties (penalties are easy, high-xG, and not repeatable skill — excluding them is fairer).
- **npG (non-penalty goals):** goals actually scored, excluding penalties.
- **xA (expected assists):** the probability that a player's pass becomes a goal — i.e. the **quality of chances created**.
- **SCA (shot-creating actions):** the offensive actions (passes, dribbles, fouls drawn) that lead directly to a shot.
- **xG + xA:** combined attacking threat — chances both **taken** and **created**. Used in the generic outfield metric set.

### Defensive / possession metrics
- **Tackles + interceptions:** ball-winning actions (taking the ball off an opponent / cutting out a pass).
- **PAdj (possession-adjusted):** adjusts defensive volume for how much possession a team concedes, so defenders in deep-block teams (who naturally face more defending) aren't over-credited.
- **Blocks + clearances:** last-ditch defending — blocking shots/passes and hoofing danger away.
- **Progressive passes / progressive actions:** passes (or carries) that move the ball a meaningful distance **toward the opponent's goal**. Measures build-up contribution.
- **Pass completion %:** share of attempted passes that reach a team-mate.
- **Aerial win %:** share of heading duels won. Key for centre-backs and target strikers.
- **Duels won %:** share of all 1v1 contests (ground + aerial) won.
- **Errors leading to a shot:** mistakes that directly gave the opponent a shot. **Lower is better** (inverted).
- **Pressures (final third):** times a player closes down an opponent in the attacking third — a proxy for high pressing.

### Goalkeeper metrics
- **PSxG (post-shot xG):** the probability a shot **on target** becomes a goal, given where it's heading. Used to judge the keeper, not the defence.
- **GSAA (Goals Saved Above Average):** `PSxG − goals conceded`. Positive = the keeper stops **more** than an average keeper would on the same shots. The headline shot-stopping metric.
- **Goals prevented:** the same shot-stopping value expressed as goals denied.
- **Save %:** share of shots on target saved.
- **Claim %:** share of catchable crosses caught/punched cleanly.
- **Defensive actions outside the box ("sweeper"):** how often the keeper acts as a sweeper behind the defensive line — a modern-keeper trait.

### Framework / product terms
- **VAEP / possession value:** academic frameworks that assign every on-ball action a value based on how much it raises/lowers the chance of scoring (or conceding). The Impact Score is *conceptually inspired* by these — it is not a literal VAEP implementation.
- **On-ball metrics:** stats about what a player does **with** the ball (or contesting it). Cortex uses only these. **Off-ball / tracking data** (positioning, runs, space creation) is explicitly **out of scope** for the MVP — a stated limitation.

---

## 8. Scoping decisions & things to consider (interview crib)

**Deliberate scope cuts (say these out loud — they signal product discipline):**
Injury/load prediction · video integration · tactical/formation tools · youth/academy tracking · contract & wage management · off-ball & tracking-data metrics · alerts/notifications · multi-club/multi-user · real data integration.

**Key decisions to defend:**
- **Why three positions deep (GK/DEF/ST), not eleven shallow:** proving the full evaluate→act loop end-to-end on three positions de-risks the *product*. Adding positions is **data entry, not new product risk**. Depth > breadth.
- **Why rule-based insights, not an AI score:** a Technical Director must be able to **trust and contest** the recommendation. Transparent thresholds + percentiles are defensible; an opaque model is not.
- **Why a percentile Impact Score + gap-based insights:** the score answers "how good," the gaps answer "so what" — and the gaps must use an **independent anchor** (peers / price), never the score itself (avoids circularity).
- **Why we don't collect data:** clubs can already *buy* data; the unmet need is **interpretation + workflow**. That's the defensible wedge and keeps us out of a commoditized, capital-intensive business.
- **Why `marketValue` is in the model from day one:** the undervalued-players use case is one **additive view** away, not a rebuild (§6).
- **Why insights are improvement-oriented (§5.1):** training is about getting better; "maintain" isn't an action. Always give the coach a relative weak point to work on.

**Honest limitations to acknowledge proactively:**
- Data is **synthetic mock data** (realistic ranges, but not real players/benchmarks).
- **On-ball only** — no off-ball movement or tracking data (the metric set's blind spot).
- **No sample-size / minutes weighting** — per-90 rates are taken at face value.
- Benchmarks are **summary distributions**, not full peer datasets.
- The composite weighting and thresholds are **opinionated defaults** — they're centralized so a club could tune them, which is itself a feature (transparency/configurability).

**First-month post-MVP roadmap (high level):**
1. First-client onboarding — swap mock data for one real provider feed (the client's league); add usage instrumentation.
2. Productionize the benchmarking / undervalued-players view (§6) + expand market coverage beyond three positions.
3. Workflow depth — saved shortlists, exportable/shareable scouting reports (PDF), basic multi-user.
4. Close the loop — track which recommendations clubs acted on (validates the core hypothesis); begin scoping off-ball / tracking-data metrics.

---

## 9. Tech & data summary (for "how is it built?")

- **Stack:** Vite + React + TypeScript + Tailwind CSS; `react-router-dom` **HashRouter**; **recharts** for radar/scatter charts. State is in-memory React context (the compare tray). No persistence, no backend.
- **Data model (`src/data/`):**
  - `types.ts` — `Player`, `Metric`, `PositionBenchmark`, `Position` (`GK | DEF | ST | MID | FB | WING`), `PlayerType` (`squad | market`).
  - `benchmarks.ts` — per-position metric definitions (label, weight, inverted, tooltip text) + synthetic benchmark distributions.
  - `players.ts` — **24 squad** players across all positions (3 GK, 5 DEF, 4 FB, 5 MID, 4 WING, 3 ST) + **24 market** players (8 GK, 8 DEF, 8 ST). Home club: *Atlético Mondego FC*; market players spread across fictional mid-tier clubs. Names are fictional Portuguese/Lusophone/mixed.
  - `lib/scoring.ts` — percentile lookup, Impact Score composite, training-insight rules, squad aggregation, the pre-wired `valueGap`, and the `config` thresholds.
- **Metric sets (radar ≈ 6 each):**
  - **Striker:** npxG/90, xA/90, npG/90, SCA/90, Aerial win %, Pressures (final third)/90.
  - **Centre-Back:** PAdj tackles+interceptions/90, Aerial win %, Blocks+clearances/90, Progressive passes/90, Pass %, Errors→shot/90 (inverted).
  - **Goalkeeper:** GSAA/90, Save %, Claim %, Pass % (distribution), Defensive actions outside box/90, Goals prevented/90.
  - **Generic outfield (MID/FB/WING):** Progressive actions/90, xG+xA/90, Pass %, Defensive actions/90, Duels won %.
- **Impact range in the current dataset:** roughly **25–88**, intentionally varied so some players clearly stand out and some clearly lag (the demo needs visible signal).
- **Deployment:** set `REPO_NAME` in `vite.config.ts` (currently a clearly-marked placeholder), then `npm run deploy` (builds and pushes `dist/` to the `gh-pages` branch). HashRouter makes deep links work on Pages with no server rewrite.
- **Run locally:** `npm install` then `npm run dev`.

---

## 10. Suggested 2-minute demo path

1. **Squad Dashboard** — "This is the club's squad. Sort by Impact Score; filter by position. The right panel aggregates the squad's biggest **training gaps**." (Filter to DEF, show priorities recompute.)
2. **A squad profile** (e.g. a mixed-profile defender) — "The radar and bars show this player vs positional peers. The insight engine tells the coach **what to train** and **what they're already good at** — gaps measured against peers, an independent anchor." (Hover a metric to show the definition; click the ⓘ on Impact Score for the methodology.)
3. **Market** — "Same evaluation, now for transfer targets. Search, filter by budget, sort by Impact or value." Open a target → **"vs your squad"**: "Would this signing actually upgrade what we already have?"
4. **Compare** — add 2–3 players → radar overlay. "Side-by-side for a shortlist decision."
5. **The reserve line:** "Market value is in the model from day one. Finding **undervalued** players across the league is one additive view away — `valueGap` is already computed." (Only if prompted / for the increment.)
