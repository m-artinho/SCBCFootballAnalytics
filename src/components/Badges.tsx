import { Position } from '../data/types'
import { POSITION_LABEL, POSITION_LABEL_PLURAL, scoreClasses } from '../lib/format'
import { useCompare } from '../context/CompareContext'

export function PositionChip({ position }: { position: Position }) {
  return (
    <span className="inline-flex items-center rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
      {position}
    </span>
  )
}

// The headline Impact Score, always shown *with its position* (§3.1).
export function ImpactBadge({
  score,
  position,
  size = 'md',
}: {
  score: number
  position: Position
  size?: 'sm' | 'md' | 'lg'
}) {
  const dims =
    size === 'lg'
      ? 'text-3xl px-4 py-2'
      : size === 'sm'
        ? 'text-sm px-2 py-0.5'
        : 'text-lg px-3 py-1'
  return (
    <span className="inline-flex flex-col items-start">
      <span className={`inline-flex items-baseline gap-1 rounded-lg border font-bold ${dims} ${scoreClasses(score)}`}>
        {score}
        {size !== 'sm' && <span className="text-xs font-medium opacity-70">/ 100</span>}
      </span>
      {size === 'lg' && (
        <span className="mt-1 text-xs font-medium text-slate-500">
          Impact Score — among {POSITION_LABEL_PLURAL[position]}
        </span>
      )}
    </span>
  )
}

export function PositionName({ position }: { position: Position }) {
  return <>{POSITION_LABEL[position]}</>
}

// Toggle a player in/out of the compare tray.
export function CompareButton({ id }: { id: string }) {
  const { has, toggle, isFull } = useCompare()
  const selected = has(id)
  const disabled = !selected && isFull
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(id)
      }}
      disabled={disabled}
      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
        selected
          ? 'border-brand bg-brand text-white hover:bg-brand-dark'
          : disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
            : 'border-slate-300 bg-white text-slate-700 hover:border-brand hover:text-brand'
      }`}
      title={disabled ? 'Compare tray is full (max 3)' : undefined}
    >
      {selected ? '✓ In compare' : '+ Compare'}
    </button>
  )
}
