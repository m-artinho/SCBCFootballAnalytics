import { ReactNode } from 'react'

// Lightweight hover/focus tooltip — pure CSS (group-hover), works on a static
// GitHub Pages build with no JS state. Used for metric definitions and to
// explain how the scoring / percentiles work.

type Align = 'left' | 'center' | 'right'

const alignClass: Record<Align, string> = {
  left: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-0',
}

// An inline "i" badge that reveals explanatory text on hover/focus.
export function InfoTip({
  text,
  align = 'center',
  width = 'w-64',
}: {
  text: ReactNode
  align?: Align
  width?: string
}) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        tabIndex={0}
        aria-label="More information"
        className="ml-1 inline-grid h-4 w-4 cursor-help place-items-center rounded-full border border-slate-300 text-[10px] font-bold leading-none text-slate-400 hover:border-brand hover:text-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
      >
        i
      </button>
      <span
        className={`pointer-events-none absolute top-6 z-30 hidden ${width} ${alignClass[align]} rounded-lg border border-slate-200 bg-white p-3 text-left text-xs font-normal normal-case leading-relaxed text-slate-600 shadow-xl group-hover:block group-focus-within:block`}
      >
        {text}
      </span>
    </span>
  )
}

// Wraps text that, on hover, reveals a definition (used for metric labels).
export function HoverDefinition({
  children,
  definition,
  align = 'left',
}: {
  children: ReactNode
  definition: ReactNode
  align?: Align
}) {
  return (
    <span className="group relative inline-flex cursor-help items-center">
      <span className="border-b border-dotted border-slate-400">{children}</span>
      <span
        className={`pointer-events-none absolute top-6 z-30 hidden w-64 ${alignClass[align]} rounded-lg border border-slate-200 bg-white p-3 text-left text-xs font-normal normal-case leading-relaxed text-slate-600 shadow-xl group-hover:block`}
      >
        {definition}
      </span>
    </span>
  )
}
