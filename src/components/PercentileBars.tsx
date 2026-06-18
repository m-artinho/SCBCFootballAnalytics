import { Metric } from '../data/types'
import { scoreBarClass } from '../lib/format'
import { HoverDefinition } from './InfoTip'

// Per-metric percentile bars (vs positional benchmark). The 50th-percentile
// median is marked so "above/below an average peer" is readable at a glance.
export function PercentileBars({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="space-y-3.5">
      {metrics.map((m) => (
        <div key={m.key}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-slate-700">
              <HoverDefinition definition={m.desc}>
                {m.label}
                {m.inverted && <span className="ml-1 text-xs text-slate-400">(lower is better)</span>}
              </HoverDefinition>
            </span>
            <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
              <span className="text-slate-500">{formatRaw(m.value)}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                p{m.percentile}
              </span>
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${scoreBarClass(m.percentile)}`}
              style={{ width: `${m.percentile}%` }}
            />
            {/* median (p50) marker */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-slate-400/70" />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatRaw(value: number): string {
  // Whole-ish numbers (counts, percentages) without decimals; rates with two.
  if (Math.abs(value) >= 10 || Number.isInteger(value)) return value.toString()
  return value.toFixed(2)
}
